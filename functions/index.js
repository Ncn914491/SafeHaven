const { onRequest, onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onValueCreated } = require('firebase-functions/v2/database');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twilio = require('twilio');

admin.initializeApp();

// Initialize Twilio client using v1 config
const getTwilioClient = () => {
  const config = functions.config();
  return twilio(config.twilio.account_sid, config.twilio.auth_token);
};

/**
 * Cloud Function to send push notifications for new alerts
 * Triggered when a new alert is created in the Realtime Database
 */
exports.sendAlertNotifications = onValueCreated('/alerts/{alertId}', async (event) => {
  const snapshot = event.data;
  try {
    const alertData = snapshot.val();

    if (!alertData.isActive) {
      console.log('Alert is not active, skipping notification');
      return null;
    }

    // Create a message for FCM
    const message = {
      notification: {
        title: alertData.title,
        body: alertData.description
      },
      data: {
        alertId: event.params.alertId,
        type: alertData.type,
        severity: alertData.severity,
        latitude: alertData.location.latitude.toString(),
        longitude: alertData.location.longitude.toString(),
        createdAt: alertData.createdAt.toString()
      },
      topic: 'alerts' // Send to all devices subscribed to the 'alerts' topic
    };

    // Send the message
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);

    return null;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
});

/**
 * Cloud Function to clean up expired alerts
 * Runs on a schedule (every hour)
 */
exports.cleanupExpiredAlerts = onSchedule('every 1 hours', async (event) => {
  try {
    const now = Date.now();

    // Get all active alerts
    const alertsSnapshot = await admin
      .database()
      .ref('/alerts')
      .orderByChild('isActive')
      .equalTo(true)
      .once('value');

    const updates = {};

    alertsSnapshot.forEach((alertSnapshot) => {
      const alert = alertSnapshot.val();

      // Check if alert is expired
      if (alert.expiresAt < now) {
        updates[`/alerts/${alertSnapshot.key}/isActive`] = false;
      }
    });

    // Apply updates if there are any
    if (Object.keys(updates).length > 0) {
      await admin.database().ref().update(updates);
      console.log(`Deactivated ${Object.keys(updates).length} expired alerts`);
    } else {
      console.log('No expired alerts to deactivate');
    }

    return null;
  } catch (error) {
    console.error('Error cleaning up expired alerts:', error);
    return null;
  }
});

/**
 * Cloud Function to send SMS alerts via Twilio
 * Callable function that can be invoked from the client
 */
exports.sendSMSAlert = onCall(async (request) => {
  const { data, auth } = request;
  try {
    // Verify authentication
    if (!auth) {
      throw new Error('User must be authenticated');
    }

    const { phoneNumber, message, alertType = 'emergency' } = data;

    // Validate input
    if (!phoneNumber || !message) {
      throw new Error('Phone number and message are required');
    }

    // Format phone number (ensure it starts with +)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;

    // Send SMS via Twilio
    const twilioClient = getTwilioClient();
    const config = functions.config();
    const smsResponse = await twilioClient.messages.create({
      body: `[SafeHaven ${alertType.toUpperCase()}] ${message}`,
      from: config.twilio.phone_number,
      to: formattedPhone
    });

    console.log('SMS sent successfully:', smsResponse.sid);

    // Log the SMS in Firestore for tracking
    await admin.firestore().collection('smsLogs').add({
      to: formattedPhone,
      message: message,
      alertType: alertType,
      twilioSid: smsResponse.sid,
      status: smsResponse.status,
      sentBy: request.auth.uid,
      sentAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      messageSid: smsResponse.sid,
      status: smsResponse.status
    };

  } catch (error) {
    console.error('Error sending SMS:', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', 'Failed to send SMS: ' + error.message);
  }
});

/**
 * Cloud Function to send bulk SMS alerts
 * Triggered when a new emergency alert is created
 */
exports.sendBulkSMSAlert = onValueCreated('/alerts/{alertId}', async (event) => {
  const snapshot = event.data;
  try {
    const alertData = snapshot.val();

    if (!alertData.isActive || alertData.severity !== 'critical') {
      console.log('Alert is not critical or not active, skipping bulk SMS');
      return null;
    }

    // Get emergency contacts from Firestore
    const contactsSnapshot = await admin.firestore()
      .collection('emergencyContacts')
      .where('isActive', '==', true)
      .get();

    if (contactsSnapshot.empty) {
      console.log('No emergency contacts found');
      return null;
    }

    const twilioClient = getTwilioClient();
    const smsPromises = [];
    const alertMessage = `CRITICAL ALERT: ${alertData.title}. ${alertData.description}. Location: ${alertData.location.address || 'See app for details'}`;

    contactsSnapshot.forEach((doc) => {
      const contact = doc.data();
      if (contact.phoneNumber) {
        const formattedPhone = contact.phoneNumber.startsWith('+') ? contact.phoneNumber : `+1${contact.phoneNumber}`;

        smsPromises.push(
          twilioClient.messages.create({
            body: alertMessage,
            from: functions.config().twilio.phone_number,
            to: formattedPhone
          }).then((message) => {
            console.log(`SMS sent to ${formattedPhone}: ${message.sid}`);
            return { success: true, to: formattedPhone, sid: message.sid };
          }).catch((error) => {
            console.error(`Failed to send SMS to ${formattedPhone}:`, error);
            return { success: false, to: formattedPhone, error: error.message };
          })
        );
      }
    });

    const results = await Promise.all(smsPromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`Bulk SMS completed: ${successCount} sent, ${failureCount} failed`);

    // Log bulk SMS operation
    await admin.firestore().collection('bulkSMSLogs').add({
      alertId: event.params.alertId,
      alertTitle: alertData.title,
      totalContacts: contactsSnapshot.size,
      successCount: successCount,
      failureCount: failureCount,
      results: results,
      sentAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return null;
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    return null;
  }
});

/**
 * Cloud Function to handle SOS requests
 * Triggered when a new SOS message is created
 */
exports.handleSOSRequest = onDocumentCreated('sosMessages/{sosId}', async (event) => {
  const snap = event.data;
  try {
    const sosData = snap.data();

    // Get emergency responders
    const respondersSnapshot = await admin.firestore()
      .collection('emergencyResponders')
      .where('isActive', '==', true)
      .get();

    if (respondersSnapshot.empty) {
      console.log('No emergency responders found');
      return null;
    }

    const sosMessage = `SOS REQUEST: ${sosData.message || 'Emergency assistance needed'}. Location: ${sosData.location?.latitude}, ${sosData.location?.longitude}. Contact: ${sosData.contactInfo?.phone || 'N/A'}`;

    const twilioClient = getTwilioClient();
    const smsPromises = [];
    respondersSnapshot.forEach((doc) => {
      const responder = doc.data();
      if (responder.phoneNumber) {
        const formattedPhone = responder.phoneNumber.startsWith('+') ? responder.phoneNumber : `+1${responder.phoneNumber}`;

        smsPromises.push(
          twilioClient.messages.create({
            body: sosMessage,
            from: functions.config().twilio.phone_number,
            to: formattedPhone
          }).then((message) => {
            console.log(`SOS SMS sent to ${formattedPhone}: ${message.sid}`);
            return { success: true, to: formattedPhone, sid: message.sid };
          }).catch((error) => {
            console.error(`Failed to send SOS SMS to ${formattedPhone}:`, error);
            return { success: false, to: formattedPhone, error: error.message };
          })
        );
      }
    });

    const results = await Promise.all(smsPromises);
    const successCount = results.filter(r => r.success).length;

    console.log(`SOS SMS notifications sent: ${successCount} successful`);

    // Update SOS message with notification status
    await snap.ref.update({
      notificationsSent: successCount,
      notificationResults: results,
      notifiedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return null;
  } catch (error) {
    console.error('Error handling SOS request:', error);
    return null;
  }
});

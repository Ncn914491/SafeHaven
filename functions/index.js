const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twilio = require('twilio');

admin.initializeApp();

// Twilio configuration
const twilioAccountSid = functions.config().twilio.account_sid;
const twilioAuthToken = functions.config().twilio.auth_token;
const twilioPhoneNumber = functions.config().twilio.phone_number;
const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

/**
 * Cloud Function to send SMS messages via Twilio
 * Triggered by an HTTP request
 */
exports.sendSMS = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { contacts, message } = data;

  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with a valid contacts array.'
    );
  }

  if (!message) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with a message.'
    );
  }

  try {
    const results = await Promise.all(
      contacts.map(async (contact) => {
        try {
          const result = await twilioClient.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: contact.phoneNumber
          });

          return {
            success: true,
            contact: contact.phoneNumber,
            messageId: result.sid
          };
        } catch (error) {
          console.error(`Error sending SMS to ${contact.phoneNumber}:`, error);
          return {
            success: false,
            contact: contact.phoneNumber,
            error: error.message
          };
        }
      })
    );

    return { results };
  } catch (error) {
    console.error('Error sending SMS messages:', error);
    throw new functions.https.HttpsError('internal', 'Error sending SMS messages.');
  }
});

/**
 * Cloud Function to send push notifications for new alerts
 * Triggered when a new alert is created in the Realtime Database
 */
exports.sendAlertNotifications = functions.database
  .ref('/alerts/{alertId}')
  .onCreate(async (snapshot, context) => {
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
          alertId: context.params.alertId,
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
exports.cleanupExpiredAlerts = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
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

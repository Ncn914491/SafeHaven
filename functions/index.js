const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Cloud Function to send push notifications for new alerts
 * Triggered when a new alert is created in the Realtime Database
 */
exports.sendAlertNotifications = functions.database.ref('/alerts/{alertId}').onCreate(async (snapshot, context) => {
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
exports.cleanupExpiredAlerts = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
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

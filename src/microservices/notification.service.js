const admin = require('firebase-admin');

async function sendToTopic(topic, notification, data) {
  const messaging = admin.messaging();
  var payload = {
    notification,
    data,
    topic,
    android: {
      priority: 'high',
      notification: {channel_id: 'high_importance_channel'},
    },
  };
  try {
    await messaging.send(payload);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

module.exports = {
  sendToTopic,
};

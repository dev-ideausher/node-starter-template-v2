const config = require('../config/config');

const {sid, authToken, phone} = config.twilio;

const client = require('twilio')(sid, authToken);

// body: string
async function sendSMSToContacts(contacts, body) {
  const msgPromises = contacts.map(async user => {
    return client.messages
      .create({body, from: phone, to: user.phone})
      .then(() => false)
      .catch(e => {
        console.log(e);
        return user;
      });
  });
  const failures = await Promise.all(msgPromises);
  return failures.filter(f => !!f);
}

module.exports = {
  sendSMSToContacts,
};

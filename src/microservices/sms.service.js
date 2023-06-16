const config = require("../config/config");

const { sid, authToken, phone } = config.twilio;

const client = require("twilio")(sid, authToken);

// body: string
async function sendSMSToContacts(contacts, body) {
    const result = { success: [], failure: [] };
    const msgPromises = contacts.map((user) => {
        client.messages
          .create({ body, from: phone, to: user.phone })
            .then(() => result.success.push(user))
            .catch((e) => { console.log(e); result.failure.push(user); });
    })
    await Promise.all(msgPromises);
    return result;
}

module.exports = {
    sendSMSToContacts
}
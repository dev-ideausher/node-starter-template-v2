const {User} = require('../models');

async function createUser(user) {
  return User.create(user);
}

async function getUserByFirebaseUId(id) {
  return User.findOne({firebaseUid: id});
}

module.exports = {
  createUser,
  getUserByFirebaseUId,
};

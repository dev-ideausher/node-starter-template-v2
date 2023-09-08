const {User} = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

async function createUser(user) {
  return await User.create(user);
}

async function getUserByFirebaseUId(id) {
  return await User.findOne({firebaseUid: id});
}

module.exports = {
  createUser,
  getUserByFirebaseUId,
};

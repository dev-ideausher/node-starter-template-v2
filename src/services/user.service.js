const {User} = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const userValidator = user => {
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found.');
  } else if (user.isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account has been deleted.');
  } else if (user.isBlocked) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User has been blocked.');
  }
};

async function getUserById(id) {
  const user = await User.findById(id);
  userValidator(user);
  return user;
}

async function getUsers(filters, options) {
  return await User.paginate(filters, options);
}

async function updateUserById(id, newDetails) {
  return await User.findByIdAndUpdate(id, newDetails, {new: true});
}

async function deleteUserById(id) {
  try {
    await User.findByIdAndDelete(id);
    return true;
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete the user');
  }
}

async function updatePreferencesById(id, newPrefs) {
  const user = await User.findById(id);
  user.preferences = {
    ...user.preferences,
    ...newPrefs,
  };
  // any other fields if you have
  await user.save();
  return user;
}

module.exports = {
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  updatePreferencesById,
};

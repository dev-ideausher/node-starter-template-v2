const mongoose = require('mongoose');
const {paginate} = require('./plugins/paginate');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      required: true,
    },
    profilePic: {
      type: {
        key: String,
        url: String,
      },
      default: null,
    },
    dob: {
      type: Date,
      default: null,
    },
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    firebaseSignInProvider: {
      type: String,
      required: true,
    },
  },
  {timestamps: true}
);

const clientSchema = new mongoose.Schema(
  {
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      // to soft delete user. if(isDeleted = true), then user is deleted.
      type: Boolean,
      default: false,
    },
    preferences: {
      type: {
        notificationEnabled: Boolean,
        locationShared: Boolean,
      },
      default: {
        notificationEnabled: false,
        locationShared: false,
      },
    },
  },
  {timestamps: true}
);

userSchema.plugin(paginate);
clientSchema.plugin(paginate);

const User = mongoose.model('User', userSchema);
const Client = User.discriminator('Client', clientSchema);

module.exports = {
  User,
  Client,
};

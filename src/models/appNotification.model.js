const mongoose = require('mongoose');

const {paginate} = require('./plugins/paginate');
const {userTypes} = require('../constants');

const appNotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    data: {
      type: Object,
      default: null,
    },
    // Specify targetRole for group notification
    targetRole: {
      type: String,
      default: null,
      enum: [...Object.values(userTypes), null],
    },
    // Specify targetUser for individual notification
    targetUser: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      default: null,
    },
    isCreatedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {timestamps: true}
);

appNotificationSchema.plugin(paginate);

const AppNotification = mongoose.model('AppNotification', appNotificationSchema);

module.exports = {AppNotification};

const {userTypes} = require('../constants');
const {AppNotification} = require('../models');

const createAppNotification = data => AppNotification.create(data);

const getAppNotifications = (filters, options) => AppNotification.paginate(filters, options);

const getMyAppNotifications = (user, filters, options) =>
  AppNotification.paginate(
    {
      ...filters,
      $or: [{targetRole: {$in: [userTypes.ALL, user.__t]}}, {user: user._id}],
      scheduledAt: {$gte: user.createdAt},
    },
    options
  );

const deleteAppNotificationById = id => AppNotification.findByIdAndDelete(id);

module.exports = {createAppNotification, getAppNotifications, getMyAppNotifications, deleteAppNotificationById};

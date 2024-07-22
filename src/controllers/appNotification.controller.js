const httpStatus = require('http-status');

const catchAsync = require('../utils/catchAsync');
const {getPaginateConfig} = require('../utils/queryPHandler');
const {appNotificationService, userService} = require('../services');
const {userTypes} = require('../constants');
const ApiError = require('../utils/ApiError');

const createAppNotification = catchAsync(async (req, res) => {
  const appNotification = await appNotificationService.createAppNotification({
    ...req.body,
    isCreatedByAdmin: true,
  });
  res.status(httpStatus.CREATED).json({data: appNotification});
});

const getAppNotifications = catchAsync(async (req, res) => {
  const {options} = getPaginateConfig(req.query);
  options.sortBy = 'createdAt';
  options.sortOrder = 'desc';

  const appNotifications = await appNotificationService.getAppNotifications(
    {
      $or: [{targetRole: {$in: [userTypes.ALL, req.user.__t]}}, {user: req.user._id}],
      scheduledAt: {$gte: req.user.createdAt},
    },
    options
  );
  res.json({data: appNotifications});
});

const getAppNotificationsSentByAdmin = catchAsync(async (req, res) => {
  const {filters, options} = getPaginateConfig(req.query);
  const appNotifications = await appNotificationService.getAppNotifications(
    {...filters, isCreatedByAdmin: true},
    options
  );
  res.json({data: appNotifications});
});

const updateAppNotificationsLastSeenAt = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.user._id, {
    appNotificationsLastSeenAt: new Date(),
  });
  res.json({data: user});
});

const deleteAppNotification = catchAsync(async (req, res) => {
  const {appNotificationId} = req.params;
  const appNotification = await appNotificationService.deleteAppNotification(appNotificationId);
  if (!appNotification)
    throw new ApiError(httpStatus.NOT_FOUND, `Could not find a notification with id ${appNotificationId}`);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createAppNotification,
  getAppNotifications,
  getAppNotificationsSentByAdmin,
  updateAppNotificationsLastSeenAt,
  deleteAppNotification,
};

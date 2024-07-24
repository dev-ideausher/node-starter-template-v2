const httpStatus = require('http-status');

const catchAsync = require('../utils/catchAsync');
const {getPaginateConfig} = require('../utils/queryPHandler');
const {appNotificationService, userService} = require('../services');
const ApiError = require('../utils/ApiError');

const createAppNotification = catchAsync(async (req, res) => {
  const appNotification = await appNotificationService.createAppNotification({
    ...req.body,
    isCreatedByAdmin: true,
  });
  res.status(httpStatus.CREATED).json({data: appNotification});
});

const getAppNotifications = catchAsync(async (req, res) => {
  const {filters, options} = getPaginateConfig(req.query);
  const data = await appNotificationService.getMyAppNotifications(req.user, filters, options);
  res.json({data});
});

const getAppNotificationsSentByAdmin = catchAsync(async (req, res) => {
  const {filters, options} = getPaginateConfig(req.query);
  const data = await appNotificationService.getAppNotifications({...filters, isCreatedByAdmin: true}, options);
  res.json({data});
});

const updateAppNotificationsLastSeenAt = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.user._id, {
    appNotificationsLastSeenAt: new Date(),
  });
  res.json({data: user});
});

const deleteAppNotification = catchAsync(async (req, res) => {
  const {id} = req.params;
  const appNotification = await appNotificationService.deleteAppNotification(id);
  if (!appNotification) throw new ApiError(httpStatus.NOT_FOUND, `Could not find a notification with id ${id}`);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createAppNotification,
  getAppNotifications,
  getAppNotificationsSentByAdmin,
  updateAppNotificationsLastSeenAt,
  deleteAppNotification,
};

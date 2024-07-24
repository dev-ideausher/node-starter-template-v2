const express = require('express');

const validate = require('../../middlewares/validate');
const firebaseAuth = require('../../middlewares/firebaseAuth');
const {appNotificationValidation} = require('../../validations');
const {appNotificationController} = require('../../controllers');

const router = express.Router();

// Send notification to a group of users
router.post(
  '/notify-people',
  firebaseAuth('Admin'),
  validate(appNotificationValidation.notifyPeople),
  appNotificationController.createAppNotification
);

// Send notification to an individual user
router.post(
  '/notify',
  firebaseAuth('Admin'),
  validate(appNotificationValidation.notify),
  appNotificationController.createAppNotification
);

// Get notifications of a user
router.get(
  '/',
  firebaseAuth('All'),
  validate(appNotificationValidation.getAppNotifications),
  appNotificationController.getAppNotifications
);

// Get notifications sent by admin
router.get(
  '/sent-by-admin',
  firebaseAuth('Admin'),
  validate(appNotificationValidation.getAppNotificationsSentByAdmin),
  appNotificationController.getAppNotificationsSentByAdmin
);

// Update notifications last seen at for current user
router.patch('/seen', firebaseAuth('All'), appNotificationController.updateAppNotificationsLastSeenAt);

// Delete a notification
router.delete(
  '/:id',
  firebaseAuth('Admin'),
  validate(appNotificationValidation.deleteAppNotification),
  appNotificationController.deleteAppNotification
);

module.exports = router;

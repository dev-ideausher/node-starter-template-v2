const express = require('express');

const validate = require('../../middlewares/validate');
const firebaseAuth = require('../../middlewares/firebaseAuth');
const {appNotificationValidation} = require('../../validations');
const {appNotificationController} = require('../../controllers');

const router = express.Router();

/**
 * @swagger
 * /v1/notifications/notify-people:
 *   post:
 *     summary: Send notification to a group of users
 *     description: Send a notification to multiple users. Admin only.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - userIds
 *             properties:
 *               title:
 *                 type: string
 *                 description: Notification title
 *               message:
 *                 type: string
 *                 description: Notification message
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to notify
 *     responses:
 *       201:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/notify-people',
  firebaseAuth('Admin'),
  validate(appNotificationValidation.notifyPeople),
  appNotificationController.createAppNotification
);

/**
 * @swagger
 * /v1/notifications/notify:
 *   post:
 *     summary: Send notification to an individual user
 *     description: Send a notification to a single user. Admin only.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - userId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Notification title
 *               message:
 *                 type: string
 *                 description: Notification message
 *               userId:
 *                 type: string
 *                 description: User ID to notify
 *     responses:
 *       201:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/notify',
  firebaseAuth('Admin'),
  validate(appNotificationValidation.notify),
  appNotificationController.createAppNotification
);

/**
 * @swagger
 * /v1/notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Retrieve all notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/',
  firebaseAuth('All'),
  validate(appNotificationValidation.getAppNotifications),
  appNotificationController.getAppNotifications
);

/**
 * @swagger
 * /v1/notifications/sent-by-admin:
 *   get:
 *     summary: Get notifications sent by admin
 *     description: Retrieve all notifications sent by admin. Admin only.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/sent-by-admin',
  firebaseAuth('Admin'),
  validate(appNotificationValidation.getAppNotificationsSentByAdmin),
  appNotificationController.getAppNotificationsSentByAdmin
);

/**
 * @swagger
 * /v1/notifications/seen:
 *   patch:
 *     summary: Update notifications last seen timestamp
 *     description: Mark all notifications as seen by updating the last seen timestamp
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Last seen timestamp updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/seen', 
  firebaseAuth('All'), 
  appNotificationController.updateAppNotificationsLastSeenAt);

/**
 * @swagger
 * /v1/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     description: Delete a notification by ID. Admin only.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The notification ID to delete
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:id',
  firebaseAuth('Admin'),
  validate(appNotificationValidation.deleteAppNotification),
  appNotificationController.deleteAppNotification
);

module.exports = router;

const express = require('express');

const validate = require('../../middlewares/validate');
const firebaseAuth = require('../../middlewares/firebaseAuth');
const userValidation = require('../../validations/user.validation');

const {userController} = require('../../controllers');
const {fileUploadService} = require('../../microservices');

const router = express.Router();

/**
 * @swagger
 * /v1/users/updateDetails:
 *   patch:
 *     summary: Update user details
 *     description: Update user profile information including profile picture
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePic:
 *                 type: string
 *                 format: binary
 *                 description: Updated profile picture
 *               name:
 *                 type: string
 *                 description: Updated user name
 *     responses:
 *       200:
 *         description: User details updated successfully
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
router.patch(
  '/updateDetails',
  fileUploadService.multerUpload.single('profilePic'),
  firebaseAuth('All'),
  validate(userValidation.updateDetails),
  userController.updateUser
);

/**
 * @swagger
 * /v1/users/updatePreferences:
 *   patch:
 *     summary: Update user preferences
 *     description: Update specific user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences:
 *                 type: object
 *                 description: User preferences object
 *     responses:
 *       200:
 *         description: Preferences updated successfully
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
router.patch(
  '/updatePreferences',
  validate(userValidation.updateUserPreferences),
  firebaseAuth('All'),
  userController.updatePreferences
);

/**
 * @swagger
 * /v1/users/{userId}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     description: Permanently delete a user account. Only accessible by admin users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:userId', 
  validate(userValidation.deleteUser), 
firebaseAuth('Admin'),
 userController.deleteUser);

/**
 * @swagger
 * /v1/users/delete/{userId}:
 *   post:
 *     summary: Soft delete a user
 *     description: Soft delete a user account (marks as deleted without permanent removal)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to soft delete
 *     responses:
 *       200:
 *         description: User soft deleted successfully
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
router.post('/delete/:userId', validate(userValidation.deleteUser), 
firebaseAuth('All'), 
userController.softDeleteUser);

module.exports = router;

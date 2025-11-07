const express = require('express');

const validate = require('../../middlewares/validate');
const firebaseAuth = require('../../middlewares/firebaseAuth');
const {authValidation} = require('../../validations');
const {fileUploadService} = require('../../microservices');

const {authController} = require('../../controllers');

const router = express.Router();

/**
 * @swagger
 * /v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return user data
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   description: User object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login',
   firebaseAuth('All'),
    authController.loginUser);

/**
 * @swagger
 * /v1/auth/register:
 *   post:
 *     summary: Register a new client user
 *     description: Register a new client user with profile picture upload
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               profilePic:
 *                 type: string
 *                 format: binary
 *                 description: User profile picture
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               name:
 *                 type: string
 *                 description: User full name
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/register',
  firebaseAuth('Client'),
  fileUploadService.multerUpload.single('profilePic'),
  validate(authValidation.register),
  authController.registerUser
);

/**
 * @swagger
 * /v1/auth/admin-secretSignup:
 *   post:
 *     summary: Register a new admin user (Secret endpoint)
 *     description: Register a new admin user. Requires admin authentication.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *               name:
 *                 type: string
 *                 description: Admin full name
 *     responses:
 *       201:
 *         description: Admin registered successfully
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
  '/admin-secretSignup',
  validate(authValidation.register),
  firebaseAuth('Admin'),
  authController.registerUser
);

module.exports = router;

const express = require('express');

const validate = require('../../middlewares/validate');
const firebaseAuth = require('../../middlewares/firebaseAuth');
const {authValidation} = require('../../validations');
const {fileUploadService} = require('../../microservices');

const {authController} = require('../../controllers');

const router = express.Router();

router.post('/login', firebaseAuth('All'), authController.loginUser);

router.post(
  '/register',
  firebaseAuth('Client'),
  fileUploadService.multerUpload.single('profilePic'),
  validate(authValidation.register),
  authController.registerUser
);

router.post(
  '/admin-secretSignup',
  validate(authValidation.register),
  firebaseAuth('Admin'),
  authController.registerUser
);

module.exports = router;

const express = require('express');
const router = express.Router();

const validate = require('../../middlewares/validate');
const firebaseAuth = require('../../middlewares/firebaseAuth');
const authValidation = require('../../validations/auth.validation');

const {authController} = require('../../controllers');

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

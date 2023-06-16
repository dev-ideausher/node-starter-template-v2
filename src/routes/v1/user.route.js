const express = require("express");
const router = express.Router();

const validate = require("../../middlewares/validate");
const firebaseAuth = require("../../middlewares/firebaseAuth");
const userValidation = require("../../validations/user.validation");

const { userController } = require("../../controllers");

// for updating userDetails
router.patch("/updateDetails",
    validate(userValidation.updateUser),
    firebaseAuth(),
    userController.updateUser
);

// for updating specific user preferences
router.patch("/updatePreferences",
    validate(userValidation.updateUserPreferences),
    firebaseAuth(),
    userController.updateUserPreferences
)

// for deleting a user
router.delete("/:userId",
    validate(userValidation.deleteUser),
    firebaseAuth(),
    userController.deleteUser
);

module.exports = router;
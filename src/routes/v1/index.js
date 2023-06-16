const express = require("express");
const router = express.Router();

const userRoute = require("./user.route");
const authRoute = require("./auth.route");

router.use("/auth", authRoute);
router.use("/users", userRoute);

module.exports = router;
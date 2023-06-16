const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");

const updateUser = catchAsync(async (req, res) => {
    const updatedUser = await userService.updateUserById(req.user._id, req.body);
    res.status(200).send({ data: updatedUser, message: "Your details are updated" });
});

const updateUserPreferences = catchAsync(async (req, res) => {
    const updatedUser = await userService.updateUserPreferencesById(req.user._id, req.body);
    res.status(200).send({ data: updatedUser, message: "Your preferences are saved" });
});

const deleteUser = catchAsync(async (req, res) => {
    if(req.user.role === "user" && req.params.userId !== req.user._id.toString()) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Sorry, you are not authorized to do this");
    }
    await userService.deleteUserById(req.params.userId);
    res.status(201).send({ message: "The user deletion process has been completed successfully." });
});

module.exports = {
    deleteUser,
    updateUser,
    updateUserPreferences,
}
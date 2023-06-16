const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

const userValidator = (user) => {
    if(!user) { 
        throw new ApiError(httpStatus.NOT_FOUND,"User not found.");
    } else if(user.isDeleted) {
        throw new ApiError(httpStatus.FORBIDDEN, "User account has been deleted.");
    } else if(user.isBlocked) {
        throw new ApiError(httpStatus.FORBIDDEN, "User has been blocked.");
    }
}

async function updateUserById(id, newDetails) {
    return await User.findByIdAndUpdate(id, newDetails, { returnDocument: "after" });
}

async function deleteUserById(id) {
    try {
        const user = await User.findById(id);
        userValidator(user);
        user.isDeleted = true;
        await user.save();
        return true;
    } catch(err) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to delete the user");
    }
}

async function updateUserPreferencesById(id, newPrefs) {
    const user =  await User.findById(id);
    userValidator(user);
    Object.keys(newPrefs).map((key) => {
        user.preferences[key] = newPrefs[key];
    })
    await user.save();
    return user;
} 

module.exports = {
    updateUserById,
    deleteUserById,
    updateUserPreferencesById
}
const Joi = require("joi");
const { objectId } = require("./custom.validation");

const updateUser = {
  body: Joi.object().keys({
    name: Joi.string().trim(),
    dob: Joi.date().iso(),
    phone: Joi.string().trim(),
    email: Joi.string().trim(),
  })
}

const updateUserPreferences = {
  body: Joi.object().keys({
      notificationEnabled: Joi.boolean(),
      locationShared: Joi.boolean(),
  })
}

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId)
  })
}


module.exports = {
  updateUser,
  deleteUser,
  updateUserPreferences
}
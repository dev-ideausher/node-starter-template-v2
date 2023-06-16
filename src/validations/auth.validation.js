const Joi = require("joi");

const register = {
  body: Joi.object().keys({
    name: Joi.string().trim(),
    dob: Joi.date().iso(),
    phone: Joi.string().trim(),
    email: Joi.string().trim(),
    preferences: Joi.object({
      notificationEnabled: Joi.boolean(),
      locationShared: Joi.boolean(),
    }).unknown(false)
  })
}

module.exports = {
  register
}
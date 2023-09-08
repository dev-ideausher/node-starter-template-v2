const Joi = require('joi');

const baseRegisterSchema = {
  firstName: Joi.string()
    .trim()
    .required(),
  lastName: Joi.string()
    .trim()
    .required(),
  gender: Joi.string()
    .trim()
    .required(),
  phone: Joi.string().trim(),
  dob: Joi.string().isoDate(),
};

const register = {
  body: Joi.object().keys({
    ...baseRegisterSchema,
  }),
};

module.exports = {
  register,
};

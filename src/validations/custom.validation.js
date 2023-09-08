const Joi = require('joi');
const {default: mongoose} = require('mongoose');

const dbOptionsSchema = {
  limit: Joi.number().default(10),
  page: Joi.number().default(1),
  sortBy: Joi.string().default('createdAt'),
  sortOrder: Joi.string()
    .valid('', 'asc')
    .default(''),
};

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid id');
  }
  return new mongoose.Types.ObjectId(value);
};

const parseStringToObject = (value, helpers) => {
  try {
    const parsedValue = JSON.parse(value);
    if (typeof parsedValue === 'object' && parsedValue !== null) {
      return parsedValue;
    }
    return helpers.message('{{#label}} must be a valid JSON object');
  } catch (error) {
    return helpers.message('{{#label}} must be a valid JSON object');
  }
};

const convertFieldToRegEx = (value, helpers) => {
  if (value === '') {
    return helpers.message('{{#label}} cannot be empty');
  }
  return new RegExp(value, 'i');
};

const validateObjectBySchema = schema => (value, helpers) => {
  const {value: validatedValue, error} = Joi.compile(schema)
    .prefs({errors: {label: 'key'}})
    .validate(value);
  if (error) {
    return helpers.message(error.details.map(details => details.message).join(', '));
  }
  return validatedValue;
};

// convert comma separated values to array of strings
const convertCSVToArray = (value, helpers) => {
  const arr = value.split(',');
  const arrValidated = arr.every(val => Joi.string().validate(val).error === undefined);
  return arrValidated ? arr : helpers.error('Invalid comma separated values');
};

const convertCSVToObjectIdArray = (value, helpers) => {
  const arr = value.split(',');
  const arrValidated = arr.every(
    val =>
      Joi.string()
        .custom(objectId)
        .validate(val).error === undefined
  );
  return arrValidated ? arr : helpers.error('Invalid');
};

async function isTextURL(text) {
  const schema = Joi.string().uri();
  const {error} = schema.validate(text);
  return !error;
}

module.exports = {
  objectId,
  isTextURL,
  dbOptionsSchema,
  convertCSVToArray,
  parseStringToObject,
  convertFieldToRegEx,
  convertCSVToObjectIdArray,
  validateObjectBySchema,
};

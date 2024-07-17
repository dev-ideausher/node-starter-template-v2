const Joi = require('joi');
const mongoose = require('mongoose');

const dbOptionsSchema = {
  limit: Joi.number().default(10),
  page: Joi.number().default(1),
  sortBy: Joi.string().default('createdAt'),
  sortOrder: Joi.string()
    .valid('', 'asc')
    .default(''),
};

const fileSchema = (field, allowedTypes, allowedExts) => ({
  fieldname: Joi.string().required(),
  originalname: Joi.string().required(),
  encoding: Joi.string().required(),
  mimetype: Joi.string().custom((val, helpers) => {
    if (!allowedTypes.includes(val)) {
      return helpers.message(`${field} file must be of type ${allowedExts.join(', ')}`);
    }
    return val;
  }),
  buffer: Joi.binary().required(),
  size: Joi.number().required(),
});

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid id');
  }
  return new mongoose.Types.ObjectId(value);
};

const parseTypedJSON = joiSchema => (value, helpers) => {
  try {
    const parsedValue = JSON.parse(value);
    if (!parsedValue) throw new Error('Could not be null');

    const validationResult = joiSchema.validate(parsedValue);
    if (validationResult.error) throw new Error(validationResult.error.message);

    return parsedValue;
  } catch (err) {
    return helpers.message(err.message || '{{#label}} must be a valid JSON object');
  }
};

const parseStringToObject = (value, helpers) => {
  try {
    const parsedValue = JSON.parse(value);
    if (typeof parsedValue === 'object' && parsedValue !== null) {
      return parsedValue;
    }
    return helpers.message('{{#label}} must be a valid JSON object');
  } catch {
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
  const tagsArray = value.split(',');
  const tagsValidated = tagsArray.every(tag => Joi.string().validate(tag).error === undefined);
  return tagsValidated ? tagsArray : helpers.error('Invalid comma separated values');
};

async function isTextURL(text) {
  const schema = Joi.string().uri();
  const {error} = schema.validate(text);
  return !error;
}

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

module.exports = {
  objectId,
  isTextURL,
  fileSchema,
  dbOptionsSchema,
  convertCSVToArray,
  parseTypedJSON,
  parseStringToObject,
  convertFieldToRegEx,
  validateObjectBySchema,
  convertCSVToObjectIdArray,
};

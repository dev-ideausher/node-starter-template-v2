const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

/**
 * Middleware function that validates user requests against a Joi schema
 */
const validate = schema => async (req, res, next) => {
  // Check if request content type is JSON
  const isJsonContentType = req.is('application/json');

  // Check if request content type is form-data
  const isFormDataContentType = req.is('multipart/form-data');

  // Reject requests with unsupported content types
  if (Object.keys(req.body).length !== 0 && !isJsonContentType && !isFormDataContentType) {
    return next(
      new ApiError(
        httpStatus.UNSUPPORTED_MEDIA_TYPE,
        'Unsupported content type. Only JSON and form-data are supported.'
      )
    );
  }
  // cherry-pick fields from the input schema ["params", "query", "body"] fields
  const validSchema = pick(schema, ['params', 'query', 'files', 'file', 'body']);

  const object = pick(req, Object.keys(validSchema));

  // Compile schema to Joi schema object and validate the request object
  const {value, error} = Joi.compile(validSchema)
    .prefs({errors: {label: 'key'}})
    .validate(object);

  console.log('🚀 ~ validate ~ error:', req.body, req.files, error);
  // If validation fails, throw 400 Bad Request error
  if (error) {
    // cleanup files buffer if exist upon validation failing
    if (req.file) req.file.buffer = 0;
    else if (Array.isArray(req.files)) {
      req.files.forEach(file => {
        file.buffer = null;
      });
    } else if (typeof req.files === 'object') {
      Object.keys(req.files).forEach(key =>
        req.files[key].forEach(file => {
          file.buffer = null;
        })
      );
    }
    console.log(req.body);
    const errorMessage = error.details.map(details => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  // Update validated fields in request with returned value
  Object.assign(req, value);

  return next();
};

module.exports = validate;

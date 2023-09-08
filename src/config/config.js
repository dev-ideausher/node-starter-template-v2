const Joi = require('joi');
const path = require('path');
const dotnev = require('dotenv');

dotnev.config({path: path.join(__dirname, '../../.env')});

// schema of env files for validation
const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid('test', 'development', 'production')
      .required(),
    PORT: Joi.number().default(8082),
    MONGODB_URL: Joi.string().required(),
    TWILIO_PHONE: Joi.string().required(),
    TWILIO_SID: Joi.string().required(),
    TWILIO_AUTH_TOKEN: Joi.string().required(),
    AWS_S3_SECRET_ACCESS_KEY: Joi.string().required(),
    AWS_S3_REGION: Joi.string().required(),
    AWS_S3_ACCESS_KEY_ID: Joi.string().required(),
    AWS_S3_BUCKET: Joi.string().required(),
  })
  .unknown();

// validating the process.env object that contains all the env variables
const {value: envVars, error} = envVarsSchema.prefs({errors: {label: 'key'}}).validate(process.env);

// throw error if the validation fails or results into false
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  twilio: {
    sid: envVars.TWILIO_SID,
    phone: envVars.TWILIO_PHONE,
    authToken: envVars.TWILIO_AUTH_TOKEN,
  },
  aws: {
    s3: {
      name: envVars.AWS_S3_BUCKET,
      region: envVars.AWS_S3_REGION,
      accessKeyId: envVars.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: envVars.AWS_S3_SECRET_ACCESS_KEY,
    },
  },
  mongoose: {
    // exception added for TDD purpose
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
};

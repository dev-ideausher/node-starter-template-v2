const Joi = require('joi');

const {userTypes} = require('../constants');
const {objectId, dbOptionsSchema} = require('./custom.validation');

const notify = {
  body: Joi.object().keys({
    targetUser: Joi.string()
      .custom(objectId)
      .required(),
    title: Joi.string()
      .trim()
      .required(),
    description: Joi.string().trim(),
    scheduledAt: Joi.date()
      .min('now')
      .default(() => new Date()),
  }),
};

const notifyPeople = {
  body: Joi.object().keys({
    targetRole: Joi.string()
      .valid(...Object.values(userTypes))
      .required(),
    title: Joi.string()
      .trim()
      .required(),
    description: Joi.string().trim(),
    scheduledAt: Joi.date()
      .min('now')
      .default(() => new Date()),
  }),
};

const getAppNotifications = {
  query: Joi.object().keys({
    ...dbOptionsSchema,
  }),
};

const getAppNotificationsSentByAdmin = getAppNotifications;

const deleteAppNotification = {
  params: Joi.object().keys({
    id: Joi.string()
      .custom(objectId)
      .required(),
  }),
};

module.exports = {
  notify,
  notifyPeople,
  getAppNotifications,
  getAppNotificationsSentByAdmin,
  deleteAppNotification,
};

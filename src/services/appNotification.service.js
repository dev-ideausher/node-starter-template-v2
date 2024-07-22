const {AppNotification} = require('../models');

const createAppNotification = data => AppNotification.create(data);

const getAppNotifications = (filters, options) => AppNotification.paginate(filters, options);

const deleteAppNotification = id => AppNotification.findByIdAndDelete(id);

module.exports = {createAppNotification, getAppNotifications, deleteAppNotification};

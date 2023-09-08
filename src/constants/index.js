const dbOptions = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'asc',
};

const fileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'application/pdf', 'application/msword'];

module.exports = {
  dbOptions,
  fileTypes,
};

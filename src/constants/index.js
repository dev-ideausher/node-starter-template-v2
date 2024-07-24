const dbOptions = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const imgTypeToExtension = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/svg': 'svg',
  'image/svg+xml': 'svg+xml',
};

const docTypeToExtension = {
  'text/plain': 'txt',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
};

const mimetypeToExtension = {
  ...imgTypeToExtension,
  ...docTypeToExtension,
};

const imageTypes = Object.keys(imgTypeToExtension);
const docTypes = Object.keys(docTypeToExtension);
const fileTypes = [...imageTypes, ...docTypes];

const userTypes = {
  ALL: 'All',
  // Add all user discriminators here
  ADMIN: 'Admin',
  NORMAL_USER: 'NormalUser',
};

module.exports = {
  userTypes,
  dbOptions,
  imageTypes,
  docTypes,
  fileTypes,
  imgTypeToExtension,
  docTypeToExtension,
  mimetypeToExtension,
};

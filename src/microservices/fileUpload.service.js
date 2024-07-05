const uuid = require('uuid').v4;
const multer = require('multer');
const storage = multer.memoryStorage();
const {getSignedUrl} = require('@aws-sdk/s3-request-presigner');
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} = require('@aws-sdk/client-s3');

const config = require('../config/config');
const {fileTypes} = require('../constants');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const {accessKeyId, region, secretAccessKey, name} = config.aws.s3;

const s3client = new S3Client({
  region,
  credentials: {accessKeyId, secretAccessKey},
});

async function fileFilter(req, file, cb) {
  if (fileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log(file);
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Invalid file or data'), false);
  }
}

function generateKey(folder, private = false) {
  return `${private ? 'private' : 'public'}/${folder}/${uuid()}`;
}

const multerUpload = multer({
  storage,
  fileFilter,
  // limits: { fileSize: 10000000, files: 10 },
});

/**
 * Generates a URL for accessing an S3 object.
 * @param {string} Key - The key (or path) of the S3 object.
 * @param {boolean} [signedUrl=false] - Indicates whether to return a signed URL.
 * @param {number} [expiresIn] - The duration (in seconds) for which the signed URL remains valid.
 * @returns {Promise<{ key: string, url: string }>} An object containing the S3 object key and URL.
 */
async function getObjectURL(Key, signedUrl = false, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Key,
    Bucket: name,
  });
  const url = await getSignedUrl(s3client, command, {expiresIn});
  return {
    key: Key,
    url: signedUrl ? url : url.split('?')[0],
  };
}

async function s3Delete(Key) {
  const command = new DeleteObjectCommand({Key, Bucket: name});
  return s3client.send(command);
}

async function s3Move(sourceKey, destinationFolderName, privateDestination = false) {
  const copyParams = {
    Bucket: name,
    CopySource: `${name}/${sourceKey}`,
    Key: `${privateDestination ? 'private' : 'public'}/${destinationFolderName}/${uuid()}`,
  };

  // NOTE:
  // Copy & Delete is not done in parallel with Promise.all
  // To ensure that all contents of the file are first copied correctly before deletion
  const result = await s3client.send(new CopyObjectCommand(copyParams)).then(() => getObjectURL(copyParams.Key));
  s3Delete(sourceKey).catch(err => {
    console.log('Could not delete original file during move operation', err);
  });
  return result;
}

async function s3Upsert({file, existingFileKey = null, folder, private = false}) {
  if (!existingFileKey && !folder)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      's3Upsert: Either existingFileKey or folder needs to be specified'
    );

  const commandInput = {
    Bucket: name,
    Key: existingFileKey || generateKey(folder, private),
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  return s3client
    .send(new PutObjectCommand(commandInput))
    .then(async () => await getObjectURL(commandInput.Key))
    .catch(() => null);
}

async function s3Upload(files, folder = 'uploads', private = false, expiresIn = 3600) {
  const params = files.map(file => {
    return {
      Bucket: name,
      Key: generateKey(folder, private),
      Body: file.buffer,
      ContentType: file.mimetype,
    };
  });

  return Promise.all(
    params.map(async param =>
      s3client
        .send(new PutObjectCommand(param))
        .then(async () => getObjectURL(param.Key, private, expiresIn))
        .catch(err => {
          console.log(err);
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload the media');
        })
    )
  );
}

module.exports = {
  s3Upload,
  s3Delete,
  s3Move,
  s3Upsert,
  getObjectURL,
  multerUpload,
};

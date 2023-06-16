const uuid = require("uuid").v4;
const multer = require('multer');
const storage = multer.memoryStorage();
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

const config = require("../config/config");
const { incidentUpdateFileTypes } = require("../constants");
const { accessKeyId, region, secretAccessKey, name } = config.aws.s3;

const s3client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey }});

async function fileFilter(req, file, cb) {
  if (incidentUpdateFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file or data, only JPEG ,PNG and pdf is allowed!'), false);
  }
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1500000, files: 5 },
});

async function getObjectURL(Key) {
  const command = new GetObjectCommand({ Key, Bucket: name });
  const url = await getSignedUrl(s3client, command);
  return url;
}

async function s3Upload(files) {
  const params = files.map((file) => {
    return {
      Bucket: name,
      Key: `uploads/${uuid()}-${file.originalname}`,
      Body: file.buffer,
    };
  });

  return await Promise.all(
    params.map((param) => s3client.send(new PutObjectCommand(param))
      .then(async () => getObjectURL(param.Key))
      .catch(() => null)
  ));
};

module.exports = {
  s3Upload,
  getObjectURL,
  multerUpload
}

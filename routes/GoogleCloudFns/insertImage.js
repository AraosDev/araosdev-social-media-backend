const { BUCKET_NAME } = require('../../constants/gcs');
const storage = require('./gcsStorage');

const uploadToGcs = (file, folderName) => new Promise((resolve, reject) => {
    const { originalname, buffer } = file;
    const bucket = storage.bucket(BUCKET_NAME);
    const blob = bucket.file(`${folderName}/${originalname}`);
    const blobStream = blob.createWriteStream({
        resumable: false
    });
    blobStream.on('finish', () => resolve('UPLOADED'))
    .on('error', () => reject('UPLOAD_FAILED'))
    .end(buffer);
});

module.exports = uploadToGcs;
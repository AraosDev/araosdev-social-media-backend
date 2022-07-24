const storage = require("./gcsStorage");

async function createBucket(bucketName) {
  await storage.createBucket(bucketName);
  console.log(`Bucket ${bucketName} created.`);
}

module.exports = {
  createBucket
}
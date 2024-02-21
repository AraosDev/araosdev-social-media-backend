const express = require('express');
const { createBucket } = require('../common/Utils/GoogleCloudFns/createBucketFn');
const router = express.Router();

router.post('/createBucket', async (req, res) => {
    const bucketName = req.body.bucketName;
    createBucket(bucketName)
        .then((response) => {
            console.log(response, 'Sucess');
        })
        .catch((err) => {
            console.log(err, 'error');
        })
});

module.exports = router;

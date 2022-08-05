const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoDb = require("../../common");
const uploadToGcs = require("../GoogleCloudFns/insertImage");
const getAllUsersFromMdb = require("../mdbFunctions/getAllUser");

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    // no larger than 5mb.
    fileSize: 5 * 1024 * 1024,
  },
});

router.use(multerMid.single("file"));

router.post("/:userName", (req, res) => {
  try {
    const userName = req.params.userName;
    const caption = req.query.caption;
    mongoDb.db.users.find(async (err, doc) => {
      if (err)
        res.status(400).json({
          status: "UPLOAD_FAILED",
        });
      else {
        if (doc.map(({ userName }) => userName).includes(userName)) {
          const uploadResponse = await uploadToGcs(req.file, userName);
          if (uploadResponse === "UPLOADED") {
            let metaData = {
              userName,
              image: req.file.originalname,
              postedOn: Math.round(new Date().getTime() / 1000),
              likes: "0",
              likedBy: [],
              caption,
              commentSection: [],
            };
            mongoDb.db["timeline-images"].insertOne(
              metaData,
              (err, response) => {
                if (err) res.status(400).json({ status: "UPLOAD_FAILED" });
                if (response) res.status(200).json({ status: "UPLOADED" });
                else res.status(400).json({ status: "UPLOAD_FAILED" });
              }
            );
          } else {
            res.status(400).json({
              status: "UPLOAD_FAILED",
            });
          }
        } else
          res.status(400).json({
            status: "USER_NOT_EXISTS",
          });
      }
    });
  } catch (e) {
    console.log({ ...e });
    res.status(400).json({
      status: "UPLOAD_FAILED",
    });
  }
});

module.exports = router;

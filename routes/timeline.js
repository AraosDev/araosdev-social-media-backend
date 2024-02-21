const express = require("express");
const { checkAuth } = require("../controllers/auth");
const router = express.Router();
const multer = require("multer");
const { getTimelineImages, postTimelineImages, updateTimelineImage } = require("../controllers/timeline");

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    // no larger than 5mb.
    fileSize: 5 * 1024 * 1024,
  },
});

router.get('/', checkAuth, getTimelineImages);
router.patch('/:dataType', checkAuth, updateTimelineImage);
router.use(multerMid.single("file"));
router.post('/', checkAuth, postTimelineImages);

module.exports = router;

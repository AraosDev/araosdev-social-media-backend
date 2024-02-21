const express = require("express");
const mongoDb = require("../common");
const { BUCKET_URL } = process.env;
const { checkAuth } = require("../controllers/auth");
const router = express.Router();
const multer = require("multer");
const { ObjectId } = require("mongodb");
const { AppError } = require("../common/Utils/appError");
const { getTimelineImages, postTimelineImages } = require("../controllers/timeline");

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    // no larger than 5mb.
    fileSize: 5 * 1024 * 1024,
  },
});

router.get('/', checkAuth, getTimelineImages);

router.patch('/:dataType', checkAuth, (req, res) => {
  const user = req.user;
  const { dataType } = req.params;
  const { postId, comment, likedFlag } = req.body;

  mongoDb.db['timelineImages'].find((postErr, postDocs) => {
    if (postErr) next(new AppError(500, 'Unknown error occurred when fetching the post'));
    else {
      const updatedPost = postDocs.find(({ _id }) => postId === _id.toString());
      if (updatedPost) {
        let updates;
        switch (dataType) {
          case 'updateLike': {
            const likes = likedFlag === 'INCREMENT' ? `${parseInt(updatedPost.likes) + 1}` : `${parseInt(updatedPost.likes) - 1}`;
            const likedBy = likedFlag === 'INCREMENT' ? [
              ...updatedPost.likedBy,
              {
                user: user.userName,
                likedOn: Math.round(new Date().getTime() / 1000),
              }
            ] : updatedPost.likedBy.filter(({ user: likedUser }) => likedUser !== user.userName);
            updates = { likes, likedBy };
            break;
          }
          case 'updateComment': {
            updates = {
              commentSection: [
                ...updatedPost.commentSection,
                {
                  userName: user.userName,
                  comment,
                  commentedOn: Math.round(new Date().getTime() / 1000),
                }
              ]
            };
            break;
          }
        }
        mongoDb.db['timelineImages'].updateOne({ _id: ObjectId(postId) }, { $set: { ...updates } }, (err, response) => {
          if (err)
            res
              .status(500)
              .json({ status: 'FAILED', message: "Unknown error occurred when updating the post", err });
          else {
            console.log(response);
            if (response.nModified) {
              res.status(200).json({ status: 'SUCCESS', updates });
            } else
              res
                .status(500)
                .json({ status: 'FAILED', message: "Unknown error occurred when updating the post" });
          }
        });
      } else
        res
          .status(404)
          .json({ status: 'FAILED', message: 'No Post found with this post id' });
    }
  });
})

router.use(multerMid.single("file"));
router.post('/', checkAuth, postTimelineImages);

module.exports = router;

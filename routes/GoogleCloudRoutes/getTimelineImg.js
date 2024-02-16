const express = require("express");
const mongoDb = require("../../common");
const { BUCKET_URL } = process.env;
const { checkAuth } = require("../mdbFunctions/checkAuth");
const router = express.Router();
const multer = require("multer");
const uploadToGcs = require("../GoogleCloudFns/insertImage");
const { ObjectId } = require("mongodb");
const AppError = require("../../common/Utils/appError");

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    // no larger than 5mb.
    fileSize: 5 * 1024 * 1024,
  },
});

router.get('/', checkAuth, (req, res, next) => {
  const { user } = req;
  if (user.userName && user.friends) {
    const userArr = [user.userName, ...user.friends.map(({ userName }) => userName)]
    if (userArr.length) {
      mongoDb.db['timelineImages'].find((err, timelineDoc) => {
        if (err) next(new AppError(500, "Internal Server Occurred"));
        else {
          const timelineImages = timelineDoc
            .filter((doc) =>
              userArr.includes(doc.userName)
            );
          if (timelineImages.length) {
            const userTimelineImgs = {
              timelineImages: timelineImages.sort((user1, user2) => user2.postedOn - user1.postedOn),
              imagePrefixUrl: BUCKET_URL
            };
            res.status(200).json({ ...userTimelineImgs });
          } else next(new AppError(404, 'No timeline images found'));
        }
      })
    }
    else next(new AppError(400, 'No users provided.'))
  } else next(new AppError(400, 'User not found'));
});

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

router.post('/', checkAuth, async (req, res, next) => {
  const { userName, _id, photo: userPhoto } = req.user;
  const { caption } = req.query;

  const uploadToGCSRes = await uploadToGcs(req.file, `${_id}/timeline`);

  if (uploadToGCSRes === 'UPLOADED') {
    const metaData = {
      userName,
      image: `${BUCKET_URL}/${_id}/timeline/${req.file.originalname}`,
      postedOn: Math.round(new Date().getTime() / 1000),
      likes: '0',
      likedBy: [],
      caption,
      commentSection: [],
      userPhoto
    };

    mongoDb.db['timelineImages'].insertOne(metaData, (err, response) => {
      if (err) next(new AppError(500, 'Unknown error occurred when uploading to MDB'))
      if (response) res.status(200).json({ status: 'SUCCESS', data: { ...metaData } });
      else next(new AppError(500, 'Unknown error occurred when uploading to MDB'));
    })
  }
  else next(new AppError(500, 'Unknown error occurred when uploading to GCS'));
});

module.exports = router;

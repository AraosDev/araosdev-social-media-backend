const express = require("express");
const mongoDb = require("../common");
const router = express.Router();

router.post("/:metaDataType/:updatedBy", (req, res) => {
  const metaDataType = req.params.metaDataType;
  const postName = req.body.postName;
  const postedBy = req.body.postedBy;
  const comment = req.body.comment;
  const likedFlag = req.body.likedFlag;
  const updatedBy = req.params.updatedBy;
  mongoDb.db.users.find((userErr, userDoc) => {
    if (userErr)
      res.status(500).json({ message: "ERROR_IN_FINDING_LIKEDBY_USER" });
    else {
      if (userDoc.map(({ userName }) => userName).includes(updatedBy)) {
        mongoDb.db["timeline-images"].find((postErr, postDoc) => {
          if (postErr)
            res.status(500).json({ message: "ERROR_IN_FETCHING_POST" });
          else {
            const updatedPost = postDoc.find(
              ({ userName, image }) =>
                userName === postedBy && image === postName
            );
            if (updatedPost) {
              let updates;
              switch (metaDataType) {
                case "updateLike": {
                  let likes =
                    likedFlag === "INCREMENT"
                      ? `${parseInt(updatedPost.likes) + 1}`
                      : `${parseInt(updatedPost.likes) - 1}`;
                  let likedBy =
                    likedFlag === "INCREMENT"
                      ? [
                          ...updatedPost.likedBy,
                          {
                            user: updatedBy,
                            likedOn: Math.round(new Date().getTime() / 1000),
                          },
                        ]
                      : updatedPost.likedBy.filter(
                          ({ user }) => user !== updatedBy
                        );
                  updates = {
                    likes,
                    likedBy,
                  };
                  break;
                }

                case "updateComment": {
                  updates = {
                    commentSection: [
                      ...updatedPost.commentSection,
                      {
                        userName: updatedBy,
                        comment,
                        commentedOn: Math.round(new Date().getTime() / 1000),
                      },
                    ],
                  };
                  break;
                }
              }
              let filter = {
                userName: updatedPost.userName,
                image: updatedPost.image,
              };
              mongoDb.db["timeline-images"].updateOne(
                { ...filter },
                { $set: { ...updates } },
                (err, response) => {
                  if (err)
                    res
                      .status(500)
                      .json({ status: "ERROR_IN_UPDATING_METADATA" });
                  else {
                    if (response.nModified) {
                      let status = `${
                        metaDataType === "updateLike" ? "LIKE_" : "COMMENT_"
                      }UPDATED`;
                      res.status(200).json({ status, updates });
                    } else
                      res
                        .status(400)
                        .json({ status: "ERROR_IN_UPDATING_METADATA" });
                  }
                }
              );
            } else res.status(404).json({ message: "POST_NOT_FOUND" });
          }
        });
      } else res.status(404).json({ message: "LIKED_BY_USER_NOT_FOUND" });
    }
  });
});

module.exports = router;

const express = require("express");
const mongoDb = require("../../common");
const { BUCKET_URL } = require("../../constants/gcs");
const router = express.Router();

router.get('/', (req, res) => {
  const { users } = req.query;
  const userArr = users.split(',');
  if (userArr.length) {
    mongoDb.db['timelineImages'].find((err, timelineDoc) => {
      if (err) res.status(500).json({ status: 500, error: "Internal Server Occurred" });
      else {
        const timelineImages = timelineDoc.filter((doc) =>
        userArr.includes(doc.userName)
        );
        if (timelineImages.length) {
          const userTimelineImgs = {
            timelineImages: timelineImages.sort((user1, user2) => user2.postedOn - user1.postedOn),
            imagePrefixUrl: BUCKET_URL
          };
          res.status(200).json({...userTimelineImgs});
        } else
          res.status(404).json({status: 'FAILED', message: 'No timeline images found'})
      }
    })
  }
  else return res.status(400).json({status: 'FAILED', message: 'No users provided.'})
})

router.get("/:username", (req, res) => {
  const username = req.params.username;
  mongoDb.db.users.find((err, userDoc) => {
    if (err) res.json({ status: 400, error: "Unknown Error" });
    else {
      const usersFrnds = [
        ...userDoc.filter((doc) => doc.userName === username)[0].friends,
        username,
      ];
      if (usersFrnds.length) {
        mongoDb.db["timelineImages"].find((err, timelineDoc) => {
          if (err)
            res.status(400).json({ status: 400, error: "Unknown Error" });
          else {
            const userTimeline = timelineDoc.filter((doc) =>
              usersFrnds.includes(doc.userName)
            );
            if (userTimeline.length) {
              const timelineResponse = {
                timelineImages: userTimeline.sort(
                  (usr1, usr2) => usr2.postedOn - usr1.postedOn
                ),
                imagePrefixUrl: BUCKET_URL,
              };
              res.status(200).json({ ...timelineResponse });
            } else
              res
                .status(404)
                .json({ error: "There's no timeline pictures for this user" });
          }
        });
      }
    }
  });
});

module.exports = router;

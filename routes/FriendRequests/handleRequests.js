const express = require("express");
const mongoDb = require("../../common");
const { updateUserAndFriendDetials } = require("./helpers");
const router = express.Router();

router.post("/:user", (req, res) => {
  const user = req.params.user;
  const requestType = req.body.requestType;
  const friend = req.body.friend;

  // Updating the user's and friend's friendRequests details
  mongoDb.db.users.find((err, doc) => {
    if (err) res.status(500).json({ status: "UNKNOWN_ERROR" });
    else if (doc.length) {
      const userDetails = doc.find(({ userName }) => userName === user);
      const friendDetails = doc.find(({ userName }) => userName === friend);
      if (!userDetails) res.status(404).json({ status: "USER_NOT_FOUND" });
      else if (!friendDetails)
        res.status(404).json({ status: "FRIEND_NOT_FOUND" });
      else if (userDetails && friendDetails) {
        let { updatedUserDetails, updatedFrndDetails } =
          updateUserAndFriendDetials(requestType, userDetails, friendDetails);
        let alreadyExists = `${requestType}_ALREADY_EXISTS`;

        if (
          updatedFrndDetails === alreadyExists ||
          updatedUserDetails === alreadyExists
        ) {
          res.status(400).json({ status: alreadyExists });
        } else {
          //Updating the userDetials
          mongoDb.db.users.updateOne(
            { userName: user },
            { $set: { ...updatedUserDetails } },
            (userUpdateErr, userUpdateRes) => {
              if (userUpdateErr)
                res.status(500).json({ status: "ERROR_IN_UPDATING_USER" });
              else if (userUpdateRes.nModified) {
                //Updating the friendDetails
                if (requestType === "REMOVE_FRIEND") {
                  res.status(200).json({ status: `${requestType}_SUCESS` });
                } else {
                  mongoDb.db.users.updateOne(
                    { userName: friend },
                    { $set: { ...updatedFrndDetails } },
                    (friendUpdateErr, friendUpdateRes) => {
                      if (friendUpdateErr)
                        res
                          .status(500)
                          .json({ status: "ERROR_IN_UPDATING_FRIEND" });
                      else if (friendUpdateRes.nModified) {
                        //Sending the success response of the requested type
                        res
                          .status(200)
                          .json({ status: `${requestType}_SUCESS` });
                      }
                    }
                  );
                }
              }
            }
          );
        }
      }
    }
  });
});

module.exports = router;

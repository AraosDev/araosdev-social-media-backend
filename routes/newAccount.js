const express = require("express");
const mongoDb = require("../common");
const router = express.Router();

router.post("/", (req, res) => {
  const userName = req.body.username;
  const email = req.body.email;
  const phoneNumber = req.body.phonenumber;
  const password = req.body.password;

  mongoDb.db.users.find((err, doc) => {
    if (err) res.json({ status: 400, updated: "FAILED" });
    if (doc.length > 10)
      res.json({
        status: 200,
        updated: "FAILED",
        message: "ACCOUNT_LIMIT_EXCEEDED",
      });
    else {
      const obj = {
        userName,
        email,
        phoneNumber,
        password,
        friends: [],
        friendRequests: {
          requestedTo: [],
          requestedBy: [],
        },
      };
      if (!doc.map(({ email }) => email).includes(email)) {
        mongoDb.db.users.insertOne(obj, (err, response) => {
          if (err) res.json({ status: 400, updated: "FAILED" });
          if (response) {
            res.json({ status: 200, updated: "OK" });
          } else res.json({ status: 400, updated: "FAILED" });
        });
      } else
        res.json({
          status: 400,
          updated: "FAILED",
          message: "ALREADY_EXISTING_ACCOUNT",
        });
    }
  });
});

module.exports = router;

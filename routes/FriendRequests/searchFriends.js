const express = require("express");
const mongoDb = require("../../common");
const router = express.Router();

router.get("/:currentUser/:searchText", (req, res) => {
  const textSearch = req.params.searchText.toLowerCase();
  const currentUser = req.params.currentUser.toLowerCase();

  mongoDb.db.users.find((err, doc) => {
    if (err) res.status(500).json({ status: "ERROR_IN_SEARCHING_USERS" });
    else if (doc.length) {
      const filteredUsers = doc
        .map(({ userName }) => userName)
        .filter(
          (user) =>
            user.substring(0, textSearch.length).toLowerCase() === textSearch &&
            user.toLowerCase() !== currentUser
        );
      if (filteredUsers.length)
        res.status(200).json({ status: "OK", filteredUsers });
      else res.status(404).json({ status: "NO_USERS_FOUND_FOR_THIS_KEYWORD" });
    } else
      res.status(404).json({ status: "NO_USER_ACCOUNTS_IN_THE_COLLECTION" });
  });
});

module.exports = router;

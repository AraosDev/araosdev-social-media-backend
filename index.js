const express = require("express");
var cors = require("cors");

const PORT = process.env.PORT || 5001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/araosdevsm/login", require("./routes/login"));
app.use("/araosdevsm/gcp-apis", require("./routes/GoogleCloudRoutes/testApi"));
app.use(
  "/araosdevsm/gcp-apis/timeline-images",
  require("./routes/GoogleCloudRoutes/getTimelineImg")
);
app.use("/araosdevsm/createaccount", require("./routes/newAccount"));
app.use(
  "/araosdevsm/searchfriends",
  require("./routes/FriendRequests/searchFriends")
);

app.use(
  "/araosdevsm/friendReq",
  require("./routes/FriendRequests/handleRequests")
);

app.listen(PORT, () => console.log(`Server running on ${PORT}`));

// https://medium.com/@olamilekan001/image-upload-with-google-cloud-storage-and-node-js-a1cf9baa1876
// https://medium.com/@olamilekan001/image-upload-with-google-cloud-storage-and-node-js-a1cf9baa1876
// https://www.bezkoder.com/google-cloud-storage-nodejs-upload-file/
// https://www.woolha.com/tutorials/node-js-upload-file-to-google-cloud-storage
// https://stackoverflow.com/questions/36661795/how-to-upload-an-image-to-google-cloud-storage-from-an-image-url-in-node

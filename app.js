const express = require("express");
var cors = require("cors");
const globalErrorHandler = require("./models/globalErrorHandler");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/araosdevsm/gcp-apis", require("./routes/testApi"));
app.use(
  "/araosdevsm/gcp-apis/timeline-images",
  require("./routes/timeline")
);
app.use(globalErrorHandler);
module.exports = app;

// https://medium.com/@olamilekan001/image-upload-with-google-cloud-storage-and-node-js-a1cf9baa1876
// https://medium.com/@olamilekan001/image-upload-with-google-cloud-storage-and-node-js-a1cf9baa1876
// https://www.bezkoder.com/google-cloud-storage-nodejs-upload-file/
// https://www.woolha.com/tutorials/node-js-upload-file-to-google-cloud-storage
// https://stackoverflow.com/questions/36661795/how-to-upload-an-image-to-google-cloud-storage-from-an-image-url-in-node

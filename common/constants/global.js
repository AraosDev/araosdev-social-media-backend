const { default: mongoose } = require("mongoose");

const { PORT, NODE_ENV } = process.env;
const loggerMsg = {
    DB_CONNECTION_SUCCESS: "Master DB is connected sucessfully",
    SERVER_CONNECTED: `Server Running in port: ${PORT} on ${NODE_ENV} environment`,
    CAPTION_IS_REQUIRED: 'Please provide a caption for your post',
    USERNAME_IS_REQUIRED: 'Please provide the id of the userName of whoever commented',
    COMMENTED_ON_IS_REQUIRED: 'Please provide the time of comment posted',
    INVALID_IMAGE: 'Please provide a valid image URL',
    IMAGE_IS_REQUIRED: 'Please provide the image URL of the post',
    LIKED_BY_USER_REQUIRED: 'Please provide the id of the liked by user',
    POSTED_ON_REQUIRED: 'Please provide the time of image posted',
    POSTED_USER_REQUIRED: 'Please provide the userName of whoever posted',
}
const ADSM_USER_SCHEMA = 'adsmUserSchema';
const errorMsgs = {
    NO_TOKEN_ERR: 'Please login before accessing this resource',
}

module.exports = { loggerMsg, errorMsgs, ADSM_USER_SCHEMA };
const { PORT, NODE_ENV } = process.env;
const loggerMsg = {
    DB_CONNECTION_SUCCESS: "Master DB is connected sucessfully",
    SERVER_CONNECTED: `Server Running in port: ${PORT} on ${NODE_ENV} environment`,
    CAPTION_IS_REQUIRED: 'Please provide a caption for your post',
    USER_IS_REQUIRED: 'Please provide the id of the user of whoever commented',
    COMMENTED_ON_IS_REQUIRED: 'Please provide the time of comment posted',
    INVALID_IMAGE: 'Please provide a valid image URL',
    IMAGE_IS_REQUIRED: 'Please provide the image URL of the post',
    LIKED_BY_USER_REQUIRED: 'Please provide the id of the liked by user',
    POSTED_ON_REQUIRED: 'Please provide the time of image posted',
    POSTED_USER_REQUIRED: 'Please provide the user id of whoever posted',
}
const ADSM_USER_SCHEMA = 'adsmUserSchema';
const errorMsgs = {
    NO_TOKEN_ERR: 'Please login before accessing this resource',
    NO_TIMELINE_IMAGES: 'There is no posts posted currently.',
    INVALID_IMAGE_ID: 'Provided image is neither no longer available or not valid a image.'
}

module.exports = { loggerMsg, errorMsgs, ADSM_USER_SCHEMA };
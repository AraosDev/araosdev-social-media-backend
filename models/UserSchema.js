const { default: mongoose } = require("mongoose");
const { ADSM_USER_SCHEMA } = require("../common/constants/global");
const validator = require('validator');

const adsmUserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true],
        unique: true,
        minLength: 5,
    },
    email: {
        type: String,
        required: [true],
        unique: true,
        validate: [validator.default.isEmail, 'Please provide a valid email'],
    },
    friends: {
        type: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'adsmUserSchema',
            },
        ],
        default: [],
    },
    friendRequests: {
        requestedTo: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'adsmUserSchema',
            },
        ],
        requestedBy: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'adsmUserSchema',
            },
        ],
    },
    photo: String,
    onlineStatus: {
        type: String,
        default: 'Unknown',
    }
},
    { toJSON: { virtuals: true }, toObject: { virtuals: true }, strict: false, collection: 'adsmuserschemas' }
);

const UsersInAdsm = mongoose.model(ADSM_USER_SCHEMA, adsmUserSchema);

module.exports = UsersInAdsm;

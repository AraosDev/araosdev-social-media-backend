const { default: mongoose } = require("mongoose");
const { ADSM_USER_SCHEMA } = require("../common/constants/global");

const adsmUserSchema = new mongoose.Schema({
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
},
    { toJSON: { virtuals: true }, toObject: { virtuals: true }, strict: false, collection: 'adsmuserschemas' }
);

const UsersInAdsm = mongoose.model(ADSM_USER_SCHEMA, adsmUserSchema);

module.exports = UsersInAdsm;

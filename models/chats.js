const { default: mongoose } = require("mongoose");
const { errorMsgs } = require("../common/constants/global");

const adsmChats = new mongoose.Schema({
    members: {
        type: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'adsmUserSchema',
            },
        ],
        required: [true],
        validate: [(val) => val.length === 2, errorMsgs.MIN_PARTICIPANTS_NOT_MET],
    },
    liveMembers: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'adsmUserSchema',
            },
            socketId: String,
        }
    ],
    type: {
        type: String,
        enum: ['ONE-ONE', 'GROUP'],
        default: 'ONE-ONE',
    },
    recentMessage: {
        type: mongoose.Schema.ObjectId,
        ref: 'messages',
    }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

const Chats = mongoose.model('chats', adsmChats);

module.exports = Chats;


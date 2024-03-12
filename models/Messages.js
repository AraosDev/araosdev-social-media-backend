const { default: mongoose } = require("mongoose");
const { errorMsgs } = require("../common/constants/global");

const MessagesSchema = new mongoose.Schema({
    sentBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'adsmUserSchema',
        required: [true, errorMsgs.SENT_BY_REQUIRED],
    },
    sentAt: {
        type: Date,
        default: new Date(),
    },
    deliveredTo: {
        type: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'adsmUserSchema'
            }
        ],
        default: [],
    },
    readBy: {
        type: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'adsmUserSchema'
            }
        ],
        default: [],
    },
    type: {
        type: String,
        enum: ['TEXT' | 'AUDIO' | 'VIDEO' | 'DOCUMENT'],
        default: 'TEXT'
    },
    content: {
        type: String,
        required: [true, errorMsgs.MSG_CONTENT_REQUIRED],
    },
    chatId: {
        type: mongoose.Schema.ObjectId,
        ref: 'adsmUserSchema',
        required: [true, errorMsgs.CHAT_REQUIRED]
    }
});

const Messages = mongoose.model('messages', MessagesSchema);

module.exports = Messages;

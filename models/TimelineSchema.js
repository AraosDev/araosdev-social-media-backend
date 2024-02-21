const mongoose = require("mongoose");
const { loggerMsg } = require("../common/constants/global");
const validator = require('validator');

const adsmTimelineSchema = new mongoose.Schema(
    {
        caption: {
            type: String,
            required: [true, loggerMsg.CAPTION_IS_REQUIRED],
        },
        commentSection: {
            type: [
                {
                    userName: {
                        type: mongoose.Schema.ObjectId,
                        required: [true, loggerMsg.USERNAME_IS_REQUIRED],
                        unique: true,
                        ref: 'adsmUserSchema',
                    },
                    comment: {
                        type: String,
                        default: '',
                    },
                    commentedOn: {
                        type: Number,
                        required: [true, loggerMsg.COMMENTED_ON_IS_REQUIRED],
                    }
                }
            ]
        },
        image: {
            type: String,
            required: [true, loggerMsg.IMAGE_IS_REQUIRED],
            validate: [validator.default.isEmail, loggerMsg.INVALID_IMAGE],
            unique: true,
        },
        likedBy: [
            {
                user: { type: mongoose.Schema.ObjectId, ref: 'adsmUserSchema' },
                likedOn: Number
            }
        ],
        likes: {
            type: Number,
            default: 0,
        },
        postedOn: {
            type: String,
            required: [true, loggerMsg.POSTED_ON_REQUIRED],
        },
        userName: {
            type: mongoose.Schema.ObjectId,
            required: [true, loggerMsg.POSTED_USER_REQUIRED],
            ref: 'adsmUserSchema'
        },
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const TimelineImages = mongoose.model('adsmTimelineImages', adsmTimelineSchema);

module.exports = TimelineImages;

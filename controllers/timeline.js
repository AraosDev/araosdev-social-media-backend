const { AppError } = require("../common/Utils/appError");
const { errorMsgs } = require("../common/constants/global");
const TimelineImages = require("../models/TimelineSchema");
const uploadToGcs = require('../common/Utils/GoogleCloudFns/insertImage');
const { ObjectId } = require("mongodb");
const { default: mongoose } = require("mongoose");

const { BUCKET_URL } = process.env;

exports.getTimelineImages = async (req, res, next) => {
    try {
        const { user } = req;
        const usersFriends = (user.friends || []).map(({ id }) => id);
        const timelineImages = await TimelineImages.find({ user: { $in: [...usersFriends, user._id] } }).sort({ postedOn: -1 });
        if (timelineImages.length) {
            const timelineRes = {
                timelineImages: timelineImages,
                imagePrefixUrl: process.env.BUCKET_URL,
            }
            res.status(200).json(timelineRes);
        } else next(new AppError(404, errorMsgs.NO_TIMELINE_IMAGES));
    } catch (e) {
        next(e);
    }
}

exports.postTimelineImages = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { caption } = req.query;
        const uploadToGCSRes = await uploadToGcs(req.file, `${_id}/timeline`);
        if (uploadToGCSRes === 'UPLOADED') {
            const metaData = {
                user: _id,
                image: `${BUCKET_URL}/${_id}/timeline/${req.file.originalname}`,
                postedOn: Math.round(new Date().getTime() / 1000),
                likes: 0,
                likedBy: [],
                caption,
                commentSection: []
            };
            const { id } = await TimelineImages.create(metaData);
            res.status(201).json({
                status: 'SUCCESS',
                data: { ...metaData, id },
            });
        }
    } catch (e) {
        next(e);
    }
}
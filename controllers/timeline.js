const { AppError } = require("../common/Utils/appError");
const { errorMsgs } = require("../common/constants/global");
const TimelineImages = require("../models/TimelineSchema");

exports.getTimelineImages = async (req, res, next) => {
    try {
        const { user } = req;
        const usersFriends = (user.friends || []).map(({ id }) => id);
        const timelineImages = await TimelineImages.find({ userName: { $in: [...usersFriends, user._id] } }).sort({ postedOn: -1 });
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
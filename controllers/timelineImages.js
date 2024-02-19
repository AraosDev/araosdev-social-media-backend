const { loggerMsg } = require("../common/constants/global");
const TimelineImages = require("../models/TimelineSchema");
const UsersInAdsm = require("../models/UserSchema");

exports.getTimelineImages = async (req, res, next) => {
    try {
        const { user } = req;
        if (user.userName && user.friends?.length) {
            const usersFriends = await UsersInAdsm.find({ _id: { $in: user.friends } });
            const timelineImages = await TimelineImages.find({ userName: { $in: [...usersFriends, user.userName] } }).sort({ postedOn: -1 });
            const timelineRes = {
                timelineImages: timelineImages,
                imagePrefixUrl: process.env.BUCKET_URL,
            }
            res.status(200).json(timelineRes);
        }
    } catch (e) {
        next(e);
    }
}
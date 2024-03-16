const { AppError, catchReqResAsync } = require("../common/Utils/appError");
const { errorMsgs } = require("../common/constants/global");
const TimelineImages = require("../models/TimelineSchema");
const uploadToGcs = require('../common/Utils/GoogleCloudFns/insertImage');
const { default: mongoose } = require("mongoose");
const { transformTimelineImages } = require("../common/Utils/transformers/timeline");

const { BUCKET_URL } = process.env;

exports.getTimelineImages = catchReqResAsync(async (req, res, next) => {
    const { user } = req;
    const usersFriends = (user.friends || []).map(({ id }) => id);
    const timelineImages = await TimelineImages
        .find({ user: { $in: [...usersFriends, user._id] } })
        .sort({ postedOn: -1 })
        .populate({ path: 'user', strictPopulate: false, select: 'photo userName' })
        .populate({ path: 'likedBy.user', strictPopulate: false, select: 'photo userName' })
        .populate({ path: 'commentSection.user', strictPopulate: false, select: 'photo userName' });
    if (timelineImages.length) {
        const timelineRes = {
            timelineImages: transformTimelineImages(timelineImages),
            imagePrefixUrl: process.env.BUCKET_URL,
        }
        res.status(200).json(timelineRes);
    } else next(new AppError(404, errorMsgs.NO_TIMELINE_IMAGES));
});

exports.postTimelineImages = catchReqResAsync(async (req, res, next) => {
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

});

exports.updateTimelineImage = catchReqResAsync(async (req, res, next) => {
    const user = req.user;
    const { dataType } = req.params;
    const { postId, comment, likedFlag } = req.body;

    const image = await TimelineImages.findOne({ _id: new mongoose.Types.ObjectId(postId) });
    if (image?._id) {
        const updatedTime = Math.round(new Date().getTime() / 1000)
        switch (dataType) {
            case 'updateLike': {
                image.likes = likedFlag === 'INCREMENT' ? image.likes + 1 : image.likes - 1;
                image.likedBy = likedFlag === 'INCREMENT' ?
                    [
                        ...image.likedBy,
                        {
                            user: user._id,
                            likedOn: updatedTime,
                        }
                    ]
                    : image.likedBy.filter(({ user: likedUser }) => likedUser.toString() !== user._id.toString());
                break;
            }
            case 'updateComment': {
                image.commentSection = [
                    ...image.commentSection,
                    {
                        user: user._id,
                        comment,
                        commentedOn: updatedTime,
                    }
                ];
                break;
            }
            default: break;
        }
        const isUpdated = await image.save();
        res.status(200).json({ status: 'SUCESS', data: isUpdated });
    } else next(new AppError(400, errorMsgs.INVALID_IMAGE_ID));

});
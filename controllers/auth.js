const { promisify } = require('util');
const { AppError } = require("../common/Utils/appError");
const { jwt, secret } = require('../common/Utils/jwt');
const { errorMsgs } = require("../common/constants/global");
const UsersInAdsm = require('../models/UserSchema');

exports.checkAuth = async (req, res, next) => {
    const token = req.headers.authorization ? req.headers.authorization.split('Bearer ')[1] : '';
    if (!token) return new AppError(401, errorMsgs.NO_TOKEN_ERR);

    const decodedUser = await promisify(jwt.verify)(token, secret);

    const user = await UsersInAdsm.findById(decodedUser.id, undefined)
        .select('+password')
        .populate({ path: 'friends', strictPopulate: false, select: '-friendRequests -__v' })
        .populate({ path: 'friendRequests.requestedBy', strictPopulate: false, select: '-friendRequests -__v' })
        .populate({ path: 'friendRequests.requestedTo', strictPopulate: false, select: '-friendRequests -__v' });
    req.user = user;
    req.token = token;

    next();
}
const { default: mongoose } = require("mongoose");
const Chats = require("../models/Chats");
const Messages = require("../models/Messages");
const UsersInAdsm = require("../models/UserSchema");

exports.getUserChatsFromDb = async (userId) => {
    const userMongoId = new mongoose.Types.ObjectId(userId);
    const query = { members: { $in: [userMongoId] } };
    const populateQuery = { _id: { $ne: userMongoId } };
    return await Chats.find(query)
        .populate({ path: 'members', strictPopulate: false, select: 'photo userName onlineStatus', match: populateQuery })
        .populate({ path: 'liveMembers.user', strictPopulate: false, select: 'photo userName onlineStatus', match: populateQuery })
        .populate({ path: 'recentMessage', strictPopulate: false, select: 'content sentAt sentBy', populate: { path: 'sentBy', select: 'userName', strictPopulate: false } });
};

exports.getUnreadCountByChat = async (chatIdArr = [], userId = '') => {
    const userMongoId = new mongoose.Types.ObjectId(userId);
    const chatMongoIdArr = chatIdArr.map((chatId) => new mongoose.Types.ObjectId(chatId));
    const matchUnread = {
        $match: {
            chatId: { $in: chatMongoIdArr },
            sentBy: { $ne: userMongoId },
            readBy: { $nin: [userMongoId] },
        }
    };
    const groupByChat = { $group: { _id: '$chatId', unreadCount: { $count: {} } } };
    const unreadCountByChat = await Messages.aggregate([matchUnread, groupByChat]);

    return unreadCountByChat;
}

exports.updateOnlineStatus = async (userId, status, socketId) => {
    const userMongoId = new mongoose.Types.ObjectId(userId);
    await UsersInAdsm.findOneAndUpdate({ _id: userMongoId }, { onlineStatus: { status, socketId } });
}

exports.updateMessageDeliveredToUser = async (userId, chatIdArr) => {
    const userMongoId = new mongoose.Types.ObjectId(userId);
    const updateAllMessagePromise = [];
    const update = { deliveredTo: [userMongoId] };
    for (const chatId of chatIdArr) {
        updateAllMessagePromise.push(Messages.findOneAndUpdate({ chatId, sentBy: { $ne: userMongoId } }, update));
    }
    await Promise.all(updateAllMessagePromise);
}

exports.disconnectOnlineUser = async (socketId) => {
    const query = { "onlineStatus.socketId": socketId };
    const update = { "onlineStatus.status": new Date().toISOString(), "onlineStatus.socketId": null };
    return await UsersInAdsm
        .findOneAndUpdate(query, update)
        .select('friends')
        .populate({ path: 'friends', strictPopulate: false, select: 'onlineStatus' });
}
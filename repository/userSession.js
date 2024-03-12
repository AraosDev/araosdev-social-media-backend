const { default: mongoose } = require("mongoose");
const Chats = require("../models/Chats");
const Messages = require("../models/Messages");
const UsersInAdsm = require("../models/UserSchema");

exports.getUserChatsFromDb = async (userId) => {
    const userMongoId = new mongoose.Types.ObjectId(userId);
    const query = { members: { $in: [userMongoId] } };
    const populateQuery = { _id: { $ne: userMongoId } };
    return await Chats.find(query)
        .populate({ path: 'members', strictPopulate: true, select: 'photo userName onlineStatus', match: populateQuery })
        .populate({ path: 'liveMembers', strictPopulate: true, select: 'photo userName onlineStatus', match: populateQuery })
        .populate({ path: 'recentMessage', strictPopulate: true, select: 'content' });
};

exports.getAllMessagesOfChat = (chatId) => {
    return Messages.find({ chatId }).sort({ sentAt: 'desc' });
}

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

exports.updateOnlineStatus = async (userId, onlineStatus) => {
    const userMongoId = new mongoose.Types.ObjectId(userId);
    await UsersInAdsm.findOneAndUpdate({ _id: userMongoId }, { onlineStatus });
}

exports.updateMessageDeliveredToUser = async (userId, chatIdArr) => {
    const userMongoId = new mongoose.Types.ObjectId(userId);
    const updateAllMessagePromise = [];
    const update = { deliveredTo: [userMongoId] };
    for (const chatId of chatIdArr) {
        updateAllMessagePromise.push(Messages.findOneAndUpdate({ chatId }, update));
    }
    await Promise.all(updateAllMessagePromise);
}

exports.updateChatLiveMembers = async (chats, userId) => {
    const updateLiveMembersPromise = [];
    chats.forEach((chat) => {
        chat.liveMembers.push(new mongoose.Types.ObjectId(userId));
        updateLiveMembersPromise.push(chat.save());
    });
    await Promise.all(updateLiveMembersPromise);
}
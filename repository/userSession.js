const { default: mongoose } = require("mongoose");
const Chats = require("../models/Chats");
const Messages = require("../models/Messages");

exports.getUserChatsFromDb = async (userId) => {
    const userMongoId = new mongoose.Types.ObjectId(userId);
    const query = { members: { $in: [userMongoId] } };
    const populateQuery = { _id: { $ne: userMongoId } };
    const chats = await Chats.find(query)
        .populate({ path: 'members', strictPopulate: true, select: 'photo userName onlineStatus', match: populateQuery })
        .populate({ path: 'liveMembers', strictPopulate: true, select: 'photo userName onlineStatus', match: populateQuery })
        .populate({ path: 'recentMessage', strictPopulate: true, select: 'content' });
    return chats ? chats.map(({ _doc }) => _doc) : [];
};

exports.getAllMessagesOfChat = async (chatId) => {
    const chatMongoId = new mongoose.Types.ObjectId(chatId);
    const messages = await Messages.find({ chatId: chatMongoId }).sort({ sentAt: 'desc' });
    return messages ? messages.map(({ _doc }) => _doc) : [];
}

exports.getUnreadCountByChat = async (chatIdArr = [], userId = '') => {
    const userMongoId = new mongoose.Types.ObjectId(userId);
    const chatMongoIdArr = chatIdArr.map((chatId) => new mongoose.Types.ObjectId(chatId));
    const matchUnread = {
        $match: {
            chatId: { $in: chatMongoIdArr },
            readBy: { $nin: [userMongoId] }
        }
    };
    const groupByChat = { $group: { _id: '$chatId', unreadCount: { $count: {} } } };
    const unreadCountByChat = await Messages.aggregate([matchUnread, groupByChat]);

    return unreadCountByChat;
}
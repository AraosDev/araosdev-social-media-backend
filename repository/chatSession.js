const { default: mongoose } = require("mongoose");
const Messages = require("../models/Messages");
const Chats = require("../models/Chats");

exports.getAllMessagesOfChat = (chatId, userId) => {
    const populateQuery = { _id: { $ne: new mongoose.Types.ObjectId(userId) } };

    return Messages.find({ chatId })
        .sort({ sentAt: 'desc' })
        .populate({ path: 'sentBy', strictPopulate: false, select: 'photo userName onlineStatus' })
        .populate({ path: 'deliveredTo', strictPopulate: false, select: 'photo userName onlineStatus', match: populateQuery })
        .populate({ path: 'readBy', strictPopulate: false, select: 'photo userName onlineStatus', match: populateQuery });
}

exports.updateReadByInMessage = async (chatId, userId) => {
    const mongoChatId = new mongoose.Types.ObjectId(chatId);
    const mongoUserId = new mongoose.Types.ObjectId(userId);
    const matchQuery = { chatId: mongoChatId, sentBy: { $ne: mongoUserId } };
    await Messages.updateMany(matchQuery, { $set: { readBy: [mongoUserId] } });
}

exports.updateLiveMembers = async (chatId, userId, socketId) => {
    const mongoChatId = new mongoose.Types.ObjectId(chatId);
    const mongoUserId = new mongoose.Types.ObjectId(userId);

    const chat = await Chats.findById(mongoChatId)
        .populate({ path: 'members', strictPopulate: false, select: 'photo userName onlineStatus' })
        .populate({ path: 'liveMembers.user', strictPopulate: false, select: 'photo userName onlineStatus' })
        .populate({ path: 'recentMessage', strictPopulate: false, select: 'content' });
    if (!chat.liveMembers.some((member) => member.user._id.toString() === userId)) {
        chat.liveMembers.push({ user: mongoUserId, socketId });
    }
    return await chat.save();
}

exports.deactivateLiveMembers = async (socketId) => {
    const chat = await Chats
        .findOne({ "liveMembers.socketId": socketId })
        .select('liveMembers')
        .populate({ path: 'liveMembers.user', strictPopulate: false, select: 'photo userName onlineStatus' });
    const liveMemberIndex = chat.liveMembers.findIndex((member) => member.socketId === socketId)
    if (liveMemberIndex !== -1) chat.liveMembers.splice(liveMemberIndex, 1);
    return await chat.save();
}

exports.getChatInfo = (chatId) => {
    const mongoChatId = new mongoose.Types.ObjectId(chatId);

    return Chats
        .findById(mongoChatId)
        .populate({ path: 'liveMembers.user', strictPopulate: false, select: 'photo userName onlineStatus' })
        .populate({ path: 'members', strictPopulate: false, select: 'photo userName onlineStatus' })
}

exports.createMessage = async (messageDoc) => {
    const insertedDoc = await Messages.insertMany(messageDoc);
    return insertedDoc.map((doc) => doc._id)[0];
}

exports.updateLastMessageInChat = async (chatId, recentMessage) => {
    const updated = await Chats
        .findByIdAndUpdate(new mongoose.Types.ObjectId(chatId), { recentMessage }, { returnDocument: 'after' })
        .populate({ path: 'members', strictPopulate: false, select: 'photo userName onlineStatus' })
        .populate({ path: 'liveMembers.user', strictPopulate: false, select: 'photo userName onlineStatus' })
        .populate({ path: 'recentMessage', strictPopulate: false, select: 'content' });
    return updated;
}
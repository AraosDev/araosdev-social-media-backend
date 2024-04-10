const { default: mongoose } = require("mongoose");
exports.transformChatInfo = (unreadMsgCountByChat, chats) => {
    const groupUnReadCountByChat = {};
    const transformedChatInfo = [];
    for (const { unreadCount, _id: chatId } of unreadMsgCountByChat) {
        groupUnReadCountByChat[chatId.toString()] = unreadCount;
    }

    for (const chat of chats) {
        const { _id, members, type, recentMessage } = chat;
        const chatId = _id.toString();
        const chatInfoDoc = {
            id: chatId,
            recepientDetails: type === 'ONE-ONE' ? {
                photo: members[0].photo,
                userName: members[0].userName,
                onlineStatus: members[0].onlineStatus.status,
            } : members,
            unreadCount: groupUnReadCountByChat[chatId] || 0,
        };
        if (recentMessage) {
            chatInfoDoc.recentMessage = {
                content: recentMessage.content,
                sentAt: recentMessage.sentAt,
                sentBy: recentMessage.sentBy.userName,
            }
        }
        transformedChatInfo.push(chatInfoDoc);
    }

    return transformedChatInfo;
}

exports.createChatDoc = (ownerId, memberId, socketId) => {
    const mongoOwnerId = new mongoose.Types.ObjectId(ownerId);
    const mongoMemberId = new mongoose.Types.ObjectId(memberId);
    return {
        members: [mongoOwnerId, mongoMemberId],
        liveMembers: [
            { user: mongoOwnerId, socketId }
        ],
    };
}
const { default: mongoose } = require("mongoose");
const { getChatInfo } = require("../../../repository/chatSession");

exports.transformMessages = (messages, userId) => {
    return messages.map((message) => {
        const messageObj = {
            id: message.id,
            sentBy: {
                photo: message.sentBy.photo,
                userName: message.sentBy.userName,
                userId: message.sentBy.id,
                onlineStatus: message.sentBy.onlineStatus.status,
            },
            sentAt: message.sentAt,
            type: message.type,
            content: message.content,
            chatId: message.chatId
        };
        if (messageObj.sentBy.userId === userId) {
            messageObj.isRead = message.readBy.length > 0;
            messageObj.isDelivered = message.deliveredTo.length > 0;
        }
        return messageObj;
    });
}

exports.createMessageDoc = async (message) => {
    const chat = await getChatInfo(message.chatId);
    const messageDoc = {
        chatId: chat._id,
        sentBy: new mongoose.Types.ObjectId(message.sentBy),
        content: message.content,
        sentAt: new Date().toISOString(),
    };

    const liveCoMember = chat.liveMembers.find(({ user }) => user.id !== message.sentBy) || {};
    if (liveCoMember.user?.id) {
        messageDoc.deliveredTo = [liveCoMember.user._id];
        messageDoc.readBy = [liveCoMember.user._id];
    } else {
        const coMember = chat.members.find(({ id }) => id !== message.sentBy) || {};
        if (coMember.onlineStatus?.status === 'Online') {
            messageDoc.deliveredTo = [coMember._id];
        }
    }
    return messageDoc;
};
exports.transformChatInfo = (unreadMsgCountByChat, chats) => {
    const groupUnReadCountByChat = {};
    const transformedChatInfo = [];
    for (const { unreadCount, _id: chatId } of unreadMsgCountByChat) {
        groupUnReadCountByChat[chatId.toString()] = unreadCount;
    }

    for (const chat of chats) {
        const { _id, members, type, recentMessage } = chat;
        const chatId = _id.toString();
        transformedChatInfo.push({
            id: chatId,
            recepientDetails: type === 'ONE-ONE' ? members[0] : members,
            recentMessage: recentMessage.content,
            unreadCount: groupUnReadCountByChat[chatId]
        });
    }

    return transformedChatInfo;
}
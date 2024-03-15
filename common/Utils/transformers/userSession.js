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
            recepientDetails: type === 'ONE-ONE' ? {
                photo: members[0].photo,
                userName: members[0].userName,
                onlineStatus: members[0].onlineStatus.status,
            } : members,
            recentMessage: recentMessage.content,
            unreadCount: groupUnReadCountByChat[chatId] || 0,
        });
    }

    return transformedChatInfo;
}
const { transformChatInfo } = require("../common/Utils/transformers/userSession");
const { getUserChatsFromDb, getUnreadCountByChat, updateOnlineStatus, updateMessageDeliveredToUser, updateChatLiveMembers } = require("../repository/userSession");

exports.establishUserSession = (websocket, request) => {
    websocket.on('message', async (msg) => {
        const { onlineStatus, userId } = JSON.parse(msg);
        const chats = await getUserChatsFromDb(userId);
        const chatIdArr = chats.map(({ _doc }) => _doc._id);
        const chatInfo = chats.map(({ _doc }) => _doc);
        const unreadMsgCountByChat = await getUnreadCountByChat(chatIdArr, userId);
        const transformedChatInfo = transformChatInfo(unreadMsgCountByChat, chatInfo);

        websocket.send(JSON.stringify(transformedChatInfo));
        await updateOnlineStatus(userId, onlineStatus);
        await updateMessageDeliveredToUser(userId, chatIdArr);
        await updateChatLiveMembers(chats, userId);
    });
}
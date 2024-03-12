const { transformChatInfo } = require("../common/Utils/transformers/userSession");
const { getUserChatsFromDb, getUnreadCountByChat, getRecentMessageByChats } = require("../repository/userSession");

exports.establishUserSession = (websocket, request) => {
    websocket.on('message', async (msg) => {
        const { onlineStatus, userId } = JSON.parse(msg);
        const chats = await getUserChatsFromDb(userId);
        const chatIdArr = chats.map(({ _id }) => _id);
        const unreadMsgCountByChat = await getUnreadCountByChat(chatIdArr, userId);
        const transformedChatInfo = transformChatInfo(unreadMsgCountByChat, chats);

        websocket.send(JSON.stringify(transformedChatInfo));
    });
}
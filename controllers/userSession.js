const { catchWebSocketAsync } = require("../common/Utils/appError");
const { transformChatInfo } = require("../common/Utils/transformers/userSession");
const { getUserChatsFromDb, getUnreadCountByChat, updateOnlineStatus, updateMessageDeliveredToUser, disconnectOnlineUser } = require("../repository/userSession");

async function getChatInfoOfUser(userData) {
    const { userId } = userData;
    const chats = await getUserChatsFromDb(userId);
    const chatIdArr = chats.map(({ _doc }) => _doc._id);
    const chatInfo = chats.map(({ _doc }) => _doc);
    const unreadMsgCountByChat = await getUnreadCountByChat(chatIdArr, userId);
    const transformedChatInfo = transformChatInfo(unreadMsgCountByChat, chatInfo);

    return { transformedChatInfo, chatIdArr, chatInfo };
}

exports.broadCastUpdatedChatInfo = (socket, userDataArr) => {
    userDataArr.forEach(async ({ id, onlineStatus }) => {
        const { transformedChatInfo } = await getChatInfoOfUser({ userId: id });
        if (onlineStatus.socketId) socket.to(onlineStatus.socketId).emit('getChatInfo', transformedChatInfo);
    });
}

exports.handleUserSession = (websocket) => {
    websocket.on('getChatInfo', catchWebSocketAsync(async (msg, callback) => {
        console.log('getUserInfo_event_triggered', websocket.id);
        const { onlineStatus, userId } = msg;
        const { transformedChatInfo, chatIdArr, chatInfo } = await getChatInfoOfUser(msg);
        callback(transformedChatInfo);
        await updateOnlineStatus(userId, onlineStatus, websocket.id);
        await updateMessageDeliveredToUser(userId, chatIdArr);

        const memberDetails = chatInfo.map(({ members }) => members.map(({ id, onlineStatus }) => ({ id, onlineStatus }))).flat();
        this.broadCastUpdatedChatInfo(websocket, memberDetails);
    }, websocket));

    websocket.on('disconnect', async () => {
        console.log('disconnect_event_triggered', websocket.id);
        const userInfo = await disconnectOnlineUser(websocket.id);
        if (userInfo) this.broadCastUpdatedChatInfo(websocket, userInfo.friends);
    });
};
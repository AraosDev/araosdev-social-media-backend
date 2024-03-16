const { catchWebSocketAsync } = require("../common/Utils/appError");
const { transformChatInfo } = require("../common/Utils/transformers/userSession");
const { getUserChatsFromDb, getUnreadCountByChat, updateOnlineStatus, updateMessageDeliveredToUser, updateChatLiveMembers } = require("../repository/userSession");

async function getChatInfoOfUser(userData) {
    const { userId } = userData;
    const chats = await getUserChatsFromDb(userId);
    const chatIdArr = chats.map(({ _doc }) => _doc._id);
    const chatInfo = chats.map(({ _doc }) => _doc);
    const unreadMsgCountByChat = await getUnreadCountByChat(chatIdArr, userId);
    const transformedChatInfo = transformChatInfo(unreadMsgCountByChat, chatInfo);

    return { transformedChatInfo, chats, chatIdArr, chatInfo };
}

function broadCastUpdatedChatInfo(socket, userDataArr) {
    userDataArr.forEach(async ({ id, onlineStatus }) => {
        const { transformedChatInfo } = await getChatInfoOfUser({ userId: id });
        if (onlineStatus.socketId) socket.to(onlineStatus.socketId).emit('message', transformedChatInfo);
    });
}

exports.handleUserSession = (websocket) => {
    websocket.on('getChatInfo', catchWebSocketAsync(async (msg, callback) => {
        const { onlineStatus, userId } = msg;
        const { transformedChatInfo, chats, chatIdArr, chatInfo } = await getChatInfoOfUser(msg);
        callback(transformedChatInfo);
        await updateOnlineStatus(userId, onlineStatus, websocket.id);
        await updateMessageDeliveredToUser(userId, chatIdArr);
        await updateChatLiveMembers(chats, userId);

        const memberDetails = chatInfo.map(({ members }) => members.map(({ id, onlineStatus }) => ({ id, onlineStatus }))).flat();
        broadCastUpdatedChatInfo(websocket, memberDetails);
    }, websocket));
};
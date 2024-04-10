const { catchWebSocketAsync } = require("../common/Utils/appError");
const { transformChatInfo, createChatDoc } = require("../common/Utils/transformers/userSession");
const { getUserChatsFromDb, getUnreadCountByChat, updateOnlineStatus, disconnectOnlineUser, updateMessageDeliveredToUser, insertChatDoc } = require("../repository/userSession");
const { sendMessagesInfo } = require("./chatSession");

async function getChatInfoOfUser(userData) {
    const { userId } = userData;
    const chats = await getUserChatsFromDb(userId);
    const chatIdArr = chats.map(({ _doc }) => _doc._id);
    const chatInfo = chats.map(({ _doc }) => _doc);
    const unreadMsgCountByChat = await getUnreadCountByChat(chatIdArr, userId);
    const transformedChatInfo = transformChatInfo(unreadMsgCountByChat, chatInfo);

    return { transformedChatInfo, chatIdArr, chatInfo };
}
async function updateMessagesAndBroadcast(io, liveMemberDetails) {
    liveMemberDetails.forEach(async ({ socketId, userId, chatId }) => {
        await sendMessagesInfo({ chatId, userId }, (messageResponse) => {
            io.of('/araosdevsm/chat-session').to(socketId).emit('getMessagesOfChat', messageResponse);
        });
    });
}

exports.broadCastUpdatedChatInfo = (socket, userDataArr) => {
    userDataArr.forEach(async ({ id, onlineStatus }) => {
        const { transformedChatInfo } = await getChatInfoOfUser({ userId: id });
        if (onlineStatus.socketId) socket.to(onlineStatus.socketId).emit('getChatInfo', transformedChatInfo);
    });
}

exports.handleUserSession = (websocket, io) => {
    websocket.on('getChatInfo', catchWebSocketAsync(async (msg, callback) => {
        console.log('getUserInfo_event_triggered', websocket.id);
        const { onlineStatus, userId } = msg;
        const { transformedChatInfo, chatIdArr, chatInfo } = await getChatInfoOfUser(msg);
        callback(transformedChatInfo);
        await updateOnlineStatus(userId, onlineStatus, websocket.id);
        await updateMessageDeliveredToUser(userId, chatIdArr);

        const memberDetails = chatInfo.map(({ members }) => members.map(({ id, onlineStatus }) => ({ id, onlineStatus }))).flat();
        const liveMemberDetails = chatInfo.map(({ liveMembers, _id }) => liveMembers.map(({ user, socketId }) => ({ userId: user._id.toString(), socketId, chatId: _id.toString() }))).flat();
        this.broadCastUpdatedChatInfo(websocket, memberDetails);
        await updateMessagesAndBroadcast(io, liveMemberDetails);
    }, websocket));

    websocket.on('createChat', catchWebSocketAsync(async (msg, callback) => {
        const { owner, member } = msg;
        const chatDoc = createChatDoc(owner, member, websocket.id);
        await insertChatDoc(chatDoc);
        const { transformedChatInfo } = await getChatInfoOfUser({ userId: owner });
        callback(transformedChatInfo);
    }));

    websocket.on('disconnect', async () => {
        console.log('disconnect_event_triggered', websocket.id);
        const userInfo = await disconnectOnlineUser(websocket.id);
        if (userInfo) this.broadCastUpdatedChatInfo(websocket, userInfo.friends);
    });
};
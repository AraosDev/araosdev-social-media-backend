const { catchWebSocketAsync } = require("../common/Utils/appError");
const { transformMessages, createMessageDoc } = require("../common/Utils/transformers/chatSession");
const { transformChatInfo } = require("../common/Utils/transformers/userSession");
const { getAllMessagesOfChat, updateReadByInMessage, updateLiveMembers, createMessage, updateLastMessageInChat, deactivateLiveMembers } = require("../repository/chatSession");
const { getUserChatsFromDb, getUnreadCountByChat } = require("../repository/userSession");

async function broadCastUpdatedMessageInfo(chatInfo, userId, socket) {
    const liveMemberInfo = chatInfo.liveMembers?.find(({ user }) => user._id.toString() !== userId) || {};
    if (liveMemberInfo.user && liveMemberInfo.socketId) {
        const { id } = liveMemberInfo.user;
        const messages = await getAllMessagesOfChat(chatInfo.id, id.toString());
        socket.to(liveMemberInfo.socketId).emit('getMessagesOfChat', { messages: transformMessages(messages, id), chatId: chatInfo.id });
    }
}

async function getChatInfoOfUser(userData) {
    const { userId } = userData;
    const chats = await getUserChatsFromDb(userId);
    const chatIdArr = chats.map(({ _doc }) => _doc._id);
    const chatInfo = chats.map(({ _doc }) => _doc);
    const unreadMsgCountByChat = await getUnreadCountByChat(chatIdArr, userId);
    const transformedChatInfo = transformChatInfo(unreadMsgCountByChat, chatInfo);

    return transformedChatInfo;
}

function broadCastUpdatedChatInfo(userDataArr, io) {
    userDataArr.forEach(async ({ id, onlineStatus }) => {
        const transformedChatInfo = await getChatInfoOfUser({ userId: id });
        if (onlineStatus.socketId && onlineStatus.status === 'Online')
            io.of('/araosdevsm/user-session').to(onlineStatus.socketId).emit('getChatInfo', transformedChatInfo);
    });
}

exports.sendMessagesInfo = async (data, callback) => {
    const { chatId, userId } = data;
    const messages = await getAllMessagesOfChat(chatId, userId);
    callback({ messages: transformMessages(messages, userId), chatId });
}

exports.handleChatSession = (websocket, io) => {
    websocket.on('getMessagesOfChat', catchWebSocketAsync(async (data, callback) => {
        const { chatId, userId } = data;
        await this.sendMessagesInfo(data, callback);
        await updateReadByInMessage(chatId, userId);
        const chatInfo = await updateLiveMembers(chatId, userId, websocket.id);
        await broadCastUpdatedMessageInfo(chatInfo, userId, websocket);
    }, websocket));

    websocket.on('sendMessage', catchWebSocketAsync(async (data, callback) => {
        const { chatId, sentBy } = data;
        const messageDoc = await createMessageDoc(data);
        const recentMessage = await createMessage(messageDoc);
        await this.sendMessagesInfo({ chatId, userId: sentBy }, callback);
        const chatInfo = await updateLastMessageInChat(chatId, recentMessage);
        await broadCastUpdatedMessageInfo(chatInfo, sentBy, websocket);
        broadCastUpdatedChatInfo(chatInfo.members, io);
    }, websocket));

    websocket.on('disconnect', async () => {
        await deactivateLiveMembers(websocket.id);
    });
}
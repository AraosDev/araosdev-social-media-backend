const { catchWebSocketAsync } = require("../common/Utils/appError");
const { transformMessages, createMessageDoc } = require("../common/Utils/transformers/chatSession");
const { getAllMessagesOfChat, updateReadByInMessage, getChatInfo, updateLiveMembers, createMessage, updateLastMessageInChat } = require("../repository/chatSession");

async function broadCastUpdatedMessageInfo(chatId, userId, socket) {
    const liveMemberInfo = (await getChatInfo(chatId, userId)).liveMembers?.find(({ user }) => user._id.toString() !== userId) || {};
    if (liveMemberInfo.user && liveMemberInfo.socketId) {
        const { id } = liveMemberInfo.user;
        const messages = await getAllMessagesOfChat(chatId, id.toString());
        socket.to(liveMemberInfo.socketId).emit('getMessagesOfChat', { messages: transformMessages(messages, id), chatId });
    }
}

exports.sendMessagesInfo = async (data, callback) => {
    const { chatId, userId } = data;
    const messages = await getAllMessagesOfChat(chatId, userId);
    callback({ messages: transformMessages(messages, userId), chatId });
}

exports.handleChatSession = (websocket) => {
    websocket.on('getMessagesOfChat', catchWebSocketAsync(async (data, callback) => {
        const { chatId, userId } = data;
        await this.sendMessagesInfo(data, callback);
        await updateReadByInMessage(chatId, userId);
        await updateLiveMembers(chatId, userId, websocket.id);
        await broadCastUpdatedMessageInfo(chatId, userId, websocket);
    }));

    websocket.on('sendMessage', catchWebSocketAsync(async (data, callback) => {
        const { chatId, sentBy, content, type } = data;
        const messageDoc = await createMessageDoc(data);
        const recentMessage = await createMessage(messageDoc);
        await this.sendMessagesInfo({ chatId, userId: sentBy }, callback);
        await updateLastMessageInChat(chatId, recentMessage);
        // broadcast updated chatinfo to the sender
        // broadcast updated chatinfo and updated messages to the user.
    }, websocket));
}
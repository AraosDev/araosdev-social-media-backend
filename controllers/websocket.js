const { Server } = require('socket.io');
const { handleUserSession } = require('./userSession');
const { handleChatSession } = require('./chatSession');

let io;
const socketConnection = (server) => {
    io = new Server(server);
    io.of('/araosdevsm/user-session').on('connection', (websocket) => {
        handleUserSession(websocket, io);
    });
    io.of('/araosdevsm/chat-session').on('connection', (websocket) => handleChatSession(websocket, io));
};

module.exports = { io, socketConnection };
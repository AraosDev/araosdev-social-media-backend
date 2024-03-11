const { handleUserSessionMsgReq } = require("../common/Utils/websocketUtils/userSession");

exports.establishUserSession = (websocket, request) => {
    websocket.on('message', async (msg) => await handleUserSessionMsgReq(msg, websocket));
}
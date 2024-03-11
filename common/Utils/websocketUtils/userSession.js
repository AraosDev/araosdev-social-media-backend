const { default: mongoose } = require("mongoose");
const Chats = require("../../../models/chats");

exports.handleUserSessionMsgReq = async (msg, websocket) => {
    const { onlineStatus, userId } = JSON.parse(msg);
    const userMongoId = new mongoose.Types.ObjectId(userId);
    const query = { members: { $in: [userMongoId] } };
    const populateQuery = { _id: { $ne: userMongoId } };
    const chats = await Chats.find(query)
        .populate({ path: 'members', strictPopulate: true, select: 'photo userName onlineStatus', match: populateQuery })
        .populate({ path: 'liveMembers', strictPopulate: true, select: 'photo userName onlineStatus', match: populateQuery });
    websocket.send(JSON.stringify({ chats }));
};
const dotEnv = require('dotenv');
dotEnv.config({ path: './.env' });
const { createServer } = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const { loggerMsg } = require('./common/constants/global');
const { socketConnection } = require('./controllers/websocket');


const { MASTER_DB_ENDPOINT: MASTER_DB, PORT } = process.env;
const { DB_CONNECTION_SUCCESS, SERVER_CONNECTED } = loggerMsg;

mongoose.connect(MASTER_DB).then(() => console.log(DB_CONNECTION_SUCCESS));
const httpServer = createServer(app);
httpServer.listen(PORT, () => console.log(SERVER_CONNECTED));
socketConnection(httpServer);
const dotEnv = require('dotenv');
dotEnv.config({ path: './.env' });
const mongoose = require('mongoose');
const app = require('./app');
const { loggerMsg } = require('./common/constants/global');

const { MASTER_DB_ENDPOINT: MASTER_DB, PORT } = process.env;
const { DB_CONNECTION_SUCCESS, SERVER_CONNECTED } = loggerMsg;

mongoose.connect(MASTER_DB).then(() => console.log(DB_CONNECTION_SUCCESS));

app.listen(PORT, () => console.log(SERVER_CONNECTED));
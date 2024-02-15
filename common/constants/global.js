const { PORT, NODE_ENV } = process.env;
const loggerMsg = {
    DB_CONNECTION_SUCCESS: "Master DB is connected sucessfully",
    SERVER_CONNECTED: `Server Running in port: ${PORT} on ${NODE_ENV} environment`
}

module.exports = loggerMsg;
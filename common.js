const mongojs = require('mongojs');

const mongoUrl = 'mongodb://localhost:27017/araosDevSM';
const db = mongojs(mongoUrl, ["users"]);

module.exports = {
    mongoUrl: mongoUrl,
    db: db
}
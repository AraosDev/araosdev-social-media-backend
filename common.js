const mongojs = require('mongojs');

const mongoUrl = 'mongodb+srv://seenus:Behappy2023@cluster0.pat3w.mongodb.net/araosdevsmdb?retryWrites=true&w=majority';
const db = mongojs(mongoUrl, ["users", "timelineImages"]);

module.exports = {
    mongoUrl: mongoUrl,
    db: db
}
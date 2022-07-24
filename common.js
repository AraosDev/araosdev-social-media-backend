const mongojs = require('mongojs');

const mongoUrl = 'mongodb+srv://seenus:seenu123@cluster0.pat3w.mongodb.net/araosdevsmdb?retryWrites=true&w=majority';
const db = mongojs(mongoUrl, ["users", "timeline-images"]);

module.exports = {
    mongoUrl: mongoUrl,
    db: db
}
const mongoDb = require('../../common');

const getAllUsersFromMdb = async () => {
    const users =  await mongoDb.db.users.find((err, doc) => {
        console.log(doc.map(({ userName }) => userName), 'Inside function');
        if (!err) return doc.map(({ userName }) => userName);
        else return [];
    });

    return users
}

module.exports = getAllUsersFromMdb;
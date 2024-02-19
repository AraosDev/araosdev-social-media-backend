const jwt = require('jsonwebtoken');

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;
function getSignedToken(id) {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
module.exports = { expiresIn: JWT_EXPIRES_IN, secret: JWT_SECRET, jwt, getSignedToken };
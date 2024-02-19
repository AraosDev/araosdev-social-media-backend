const { default: mongoose } = require("mongoose");
const { ADSM_USER_SCHEMA } = require("../common/constants/global");

const UsersInAdsm = mongoose.model(ADSM_USER_SCHEMA, new mongoose.Schema({}, { strict: false }));

module.exports = UsersInAdsm;

const configs = require("../../../knexfile");
const knex = require("knex");

const connection = knex(configs.development);

module.exports = connection;

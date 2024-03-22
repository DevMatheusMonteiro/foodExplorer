const knex = require("../database/knex");

class CategoriesController {
  async index(req, res) {
    const categories = await knex("categories").groupBy("name");

    return res.status(200).json(categories);
  }
}

module.exports = CategoriesController;

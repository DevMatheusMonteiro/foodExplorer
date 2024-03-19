const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class UserValidationController {
  async show(req, res) {
    const { id } = req.user;

    const user = await knex("users").where({ id }).first();

    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    return res.status(200).json({ role: user.role });
  }
}

module.exports = UserValidationController;

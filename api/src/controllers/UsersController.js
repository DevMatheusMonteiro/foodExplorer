const knex = require("../database/knex");
const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");

class UsersController {
  async create(req, res) {
    const { name, email, password } = req.body;

    const checkUserExists = await knex("users").where({ email }).first();

    if (checkUserExists) {
      throw new AppError("Email já cadastrado");
    }

    const hashedPassword = await hash(password, 8);

    await knex("users").insert({ name, email, password: hashedPassword });

    return res.status(201).json();
  }

  async update(req, res) {
    const { name, email, currentPassword, password } = req.body;
    const { id } = req.user;

    const user = await knex("users").where({ id }).first();

    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    if (email) {
      const userUpdate = await knex("users").first().where({ email });

      if (userUpdate && userUpdate.id !== user.id) {
        throw new AppError("Email já cadastrado!");
      }
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (password && !currentPassword) {
      throw new AppError("Informe a senha atual!");
    }

    if (password && currentPassword) {
      const checkPassword = await compare(currentPassword, user.password);

      if (!checkPassword) {
        throw new AppError("Senha atual incorreta!");
      }

      const hashedPassword = await hash(password, 8);

      user.password = hashedPassword;
    }

    await knex("users")
      .update({
        name: user.name,
        email: user.email,
        password: user.password,
        updated_at: knex.fn.now(),
      })
      .where({ id: user.id });

    return res.status(200).json();
  }

  async delete(req, res) {
    const { id } = req.user;

    const user = await knex("users").where({ id }).first();

    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    await knex("users").where({ id }).delete();

    res.clearCookie("token");

    return res.status(204).json();
  }
}

module.exports = UsersController;

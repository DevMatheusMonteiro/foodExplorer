const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const { compare } = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const { jwt } = require("../configs/auth");

class SessionsController {
  async create(req, res) {
    const { email, password } = req.body;

    const user = await knex("users").where({ email }).first();

    if (!user) {
      throw new AppError("Email e/ou senha incorretos", 401);
    }

    const passwordMatches = await compare(password, user.password);

    if (!passwordMatches) {
      throw new AppError("Email e/ou senha incorretos", 401);
    }

    const { secret, expiresIn } = jwt;

    const token = sign({ role: user.role }, secret, {
      subject: String(user.id),
      expiresIn,
    });

    res.cookie("token", token);

    delete user.password;
    delete user.role;
    delete user.id;

    return res.status(200).json({ user });
  }

  async delete(req, res) {
    res.clearCookie("token");

    res.status(204).json();
  }
}

module.exports = SessionsController;

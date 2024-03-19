const knex = require("../database/knex");
const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");

class EmployeesUserController {
  async create(req, res) {
    const { name, email, password } = req.body;

    const checkUserExists = await knex("users").where({ email }).first();

    if (checkUserExists) {
      throw new AppError("Email já cadastrado");
    }

    const hashedPassword = await hash(password, 8);

    await knex("users").insert({
      name,
      email,
      password: hashedPassword,
      role: "employee",
    });

    return res.status(201).json();
  }

  async update(req, res) {
    const { name, email, password, role } = req.body;
    const employeeId = req.params.id;

    const { id } = req.user;

    const employee = await knex("users")
      .where({ id: employeeId })
      .whereNot({ id })
      .whereNot({ role: "customer" })
      .first();

    if (!employee) {
      throw new AppError("Funcionário não encontrado", 404);
    }

    if (email) {
      const employeeUpdate = await knex("users").where({ email }).first();

      if (employeeUpdate && employeeUpdate.id !== employee.id) {
        throw new AppError("Email já cadastrado!");
      }
    }

    if (role && role !== "employee" && role !== "admin") {
      throw new AppError(`Autorização inválida`);
    }

    employee.name = name ?? employee.name;
    employee.role = role ?? employee.role;
    employee.email = email ?? employee.email;

    if (password) {
      const hashedPassword = await hash(password, 8);

      employee.password = hashedPassword;
    }

    await knex("users")
      .update({
        name: employee.name,
        email: employee.email,
        password: employee.password,
        role: employee.role,
        updated_at: knex.fn.now(),
      })
      .where({ id: employee.id });

    return res.status(200).json();
  }

  async delete(req, res) {
    const employeeId = req.params.id;
    const { id } = req.user;

    const employee = await knex("users")
      .where({ id: employeeId })
      .whereNot({ id })
      .whereNot({ role: "customer" })
      .first();

    if (!employee) {
      throw new AppError("Funcionário não encontrado", 404);
    }

    await knex("users").where({ id: employee.id }).delete();

    return res.status(204).json();
  }

  async index(req, res) {
    const { email, name, filter } = req.query;
    const { id } = req.user;

    let employees;

    if (filter === "admin") {
      employees = await knex("users")
        .select("id", "email", "name", "role")
        .whereNot({ id })
        .where({ role: "admin" })
        .whereLike("email", `%${email}%`)
        .whereLike("name", `%${name}%`)
        .orderBy("name");
    } else if (filter === "employee") {
      employees = await knex("users")
        .select("id", "email", "name", "role")
        .whereNot({ id })
        .where({ role: "employee" })
        .whereLike("email", `%${email}%`)
        .whereLike("name", `%${name}%`)
        .orderBy("name");
    } else {
      employees = await knex("users")
        .select("id", "email", "name", "role")
        .whereNot({ id })
        .whereNot({ role: "customer" })
        .whereLike("email", `%${email}%`)
        .whereLike("name", `%${name}%`)
        .orderBy("name");
    }

    return res.status(200).json(employees);
  }

  async show(req, res) {
    const employeeId = req.params.id;
    const { id } = req.user;

    const employee = await knex("users")
      .where({ id: employeeId })
      .whereNot({ id })
      .whereNot({ role: "customer" })
      .first();

    if (!employee) {
      throw new AppError("Funcionário não encontrado", 404);
    }

    return res.status(200).json(employee);
  }
}

module.exports = EmployeesUserController;

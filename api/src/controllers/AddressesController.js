const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class AddressesController {
  async create(req, res) {
    const {
      type,
      street,
      number,
      neighborhood,
      complement,
      city,
      state,
      zipCode,
    } = req.body;

    const user_id = req.user.id;

    if (
      !street ||
      !number ||
      !neighborhood ||
      !complement ||
      !city ||
      !state ||
      !zipCode
    ) {
      throw new AppError("Endereço incompleto!");
    }

    const checkAddressExists = await knex("addresses")
      .select(
        "id",
        "street",
        "number",
        "neighborhood",
        "complement",
        "city",
        "state",
        "zipCode",
        "user_id"
      )
      .where({
        street,
        number,
        neighborhood,
        complement,
        city,
        state,
        zipCode,
        user_id,
      })
      .first();

    await knex("addresses")
      .where({ selected: true, user_id })
      .update({ selected: false });

    if (type) {
      await knex("addresses")
        .where({
          type,
          user_id,
        })
        .update({ type: "general" });
    }

    if (checkAddressExists) {
      if (type) {
        await knex("addresses").where(checkAddressExists).update({
          selected: true,
          type: type,
          updated_at: knex.fn.now(),
        });
      } else {
        await knex("addresses").where(checkAddressExists).update({
          selected: true,
          updated_at: knex.fn.now(),
        });
      }
      return res.status(200).json();
    }

    if (type) {
      await knex("addresses").insert({
        type,
        street,
        number,
        neighborhood,
        complement,
        city,
        state,
        zipCode,
        user_id,
      });
    } else {
      await knex("addresses").insert({
        street,
        number,
        neighborhood,
        complement,
        city,
        state,
        zipCode,
        user_id,
      });
    }

    return res.status(201).json();
  }

  async update(req, res) {
    const {
      type,
      street,
      number,
      neighborhood,
      complement,
      city,
      state,
      zipCode,
    } = req.body;

    const user_id = req.user.id;

    const { id } = req.params;

    const address = await knex("addresses").where({ id, user_id }).first();

    const checkAddressExists = await knex("addresses")
      .select(
        "id",
        "street",
        "number",
        "neighborhood",
        "complement",
        "city",
        "state",
        "zipCode",
        "user_id"
      )
      .where({
        street,
        number,
        neighborhood,
        complement,
        city,
        state,
        zipCode,
        user_id,
      })
      .first();

    if (!address) {
      throw new AppError("Endereço não encontrado!", 404);
    }

    if (type) {
      await knex("addresses")
        .where({
          type,
          user_id,
        })
        .update({ type: "general" });
    }

    if (checkAddressExists && checkAddressExists.id !== address.id) {
      if (type) {
        await knex("addresses")
          .where(checkAddressExists)
          .update({ type: type, updated_at: knex.fn.now() });
      } else {
        await knex("addresses")
          .where(checkAddressExists)
          .update({ updated_at: knex.fn.now() });
      }
      return res.status(200).json();
    }

    address.type = type ?? address.type;
    address.street = street ?? address.street;
    address.number = number ?? address.number;
    address.neighborhood = neighborhood ?? address.neighborhood;
    address.complement = complement ?? address.complement;
    address.city = city ?? address.city;
    address.state = state ?? address.state;
    address.zipCode = zipCode ?? address.zipCode;

    await knex("addresses")
      .update({
        type: address.type,
        street: address.street,
        number: address.number,
        neighborhood: address.neighborhood,
        complement: address.complement,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        updated_at: knex.fn.now(),
      })
      .where({ id: address.id });

    return res.status(200).json();
  }

  async delete(req, res) {
    const { id } = req.params;
    const user_id = req.user.id;

    const address = await knex("addresses").where({ id, user_id }).first();

    if (!address) {
      throw new AppError("Endereço não encontrado", 404);
    }

    if (address.selected === 1) {
      throw new AppError(
        "O endereço não pode ser deletado se estiver selecionado!"
      );
    }

    await knex("addresses").where({ id: address.id }).delete();

    return res.status(204).json();
  }

  async index(req, res) {
    const { street, number } = req.query;
    const user_id = req.user.id;

    const addresses = await knex("addresses")
      .where({ user_id })
      .andWhereLike("street", `%${street}%`)
      .andWhere({ user_id })
      .andWhereLike("number", `%${number}%`)
      .orderBy("updated_at", "desc");

    return res.status(200).json(addresses);
  }

  async show(req, res) {
    const { id } = req.params;
    const user_id = req.user.id;

    const address = await knex("addresses").where({ id, user_id }).first();

    if (!address) {
      throw new AppError("Endereço não encontrado", 404);
    }

    return res.status(200).json(address);
  }
}

module.exports = AddressesController;

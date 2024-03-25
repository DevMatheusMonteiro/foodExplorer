const knex = require("../database/knex");
const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");

class CardsController {
  async create(req, res) {
    const {
      nickname,
      type,
      number,
      expirationDate,
      holderName,
      securityCode,
      cpf,
    } = req.body;

    const user_id = req.user.id;

    const cards = await knex("cards").where({ user_id });

    const lastFourCharactersOfTheNumber = number.substring(
      number.length,
      number.length - 4
    );

    const beforeTheLastFourNumbers = number.substring(0, number.length - 4);

    for (const card of cards) {
      if (card.nickname === nickname) {
        throw new AppError("Já existe um cartão com esse apelido");
      }

      const lastFourCharacters = card.number.substring(
        card.number.length,
        card.number.length - 4
      );

      const compareLastFourNumbers =
        lastFourCharactersOfTheNumber === lastFourCharacters;

      const charactersBeforeTheLastFour = card.number.substring(
        0,
        card.number.length - 4
      );
      const compareBeforeTheLastFourNumbers = await compare(
        beforeTheLastFourNumbers,
        charactersBeforeTheLastFour
      );

      if (
        (compareBeforeTheLastFourNumbers && compareLastFourNumbers) ||
        compareLastFourNumbers
      ) {
        throw new AppError("Esse cartão já foi cadastrado");
      }
    }

    const hashedFirstTwelveCharactersOfTheNumber = await hash(
      beforeTheLastFourNumbers,
      8
    );

    const fullCardNumber =
      hashedFirstTwelveCharactersOfTheNumber + lastFourCharactersOfTheNumber;

    const hashedSecurityCode = await hash(securityCode, 8);

    const [month, year] = expirationDate.split("/");

    const date = new Date(year, Number(month) - 1)
      .toISOString()
      .replace("T", " ")
      .replace(".000Z", "");

    await knex("cards").insert({
      nickname,
      type,
      number: fullCardNumber,
      expirationDate: date,
      holderName,
      securityCode: hashedSecurityCode,
      cpf,
      user_id,
    });

    return res.status(201).json();
  }

  async update(req, res) {
    const {
      nickname,
      type,
      number,
      expirationDate,
      holderName,
      securityCode,
      cpf,
    } = req.body;

    const { id } = req.params;

    const user_id = req.user.id;

    const cardUpdating = await knex("cards").where({ id, user_id }).first();

    const cards = await knex("cards").whereNot({ id }).andWhere({ user_id });

    console.log(cards);

    if (nickname) {
      if (cards.length > 0) {
        if (cards.some((card) => card.nickname === nickname)) {
          throw new AppError("Já existe um cartão com esse apelido");
        }
      }
    }

    if (number) {
      const lastFourCharactersOfTheNumber = number.substring(
        number.length,
        number.length - 4
      );

      const beforeTheLastFourNumbers = number.substring(0, number.length - 4);

      if (cards.length > 0) {
        for (const card of cards) {
          const lastFourCharacters = card.number.substring(
            card.number.length,
            card.number.length - 4
          );

          const compareLastFourNumbers =
            lastFourCharactersOfTheNumber === lastFourCharacters;

          const charactersBeforeTheLastFour = card.number.substring(
            0,
            card.number.length - 4
          );
          const compareBeforeTheLastFourNumbers = await compare(
            beforeTheLastFourNumbers,
            charactersBeforeTheLastFour
          );

          if (
            (compareBeforeTheLastFourNumbers && compareLastFourNumbers) ||
            compareLastFourNumbers
          ) {
            throw new AppError("Esse cartão já foi cadastrado");
          }
        }
      }

      const hashedFirstTwelveCharactersOfTheNumber = await hash(
        beforeTheLastFourNumbers,
        8
      );

      cardUpdating.number =
        hashedFirstTwelveCharactersOfTheNumber + lastFourCharactersOfTheNumber;
    }

    if (securityCode) {
      const hashedSecurityCode = await hash(securityCode, 8);

      cardUpdating.securityCode = hashedSecurityCode;
    }

    if (expirationDate) {
      const [month, year] = expirationDate.split("/");

      const date = new Date(year, Number(month) - 1)
        .toISOString()
        .replace("T", " ")
        .replace(".000Z", "");

      cardUpdating.expirationDate = date;
    }

    cardUpdating.nickname = nickname ?? cardUpdating.nickname;
    cardUpdating.type = type ?? cardUpdating.type;
    cardUpdating.holderName = holderName ?? cardUpdating.holderName;
    cardUpdating.cpf = cpf ?? cardUpdating.cpf;

    await knex("cards")
      .update({
        nickname: cardUpdating.nickname,
        type: cardUpdating.type,
        number: cardUpdating.number,
        expirationDate: cardUpdating.expirationDate,
        holderName: cardUpdating.holderName,
        securityCode: cardUpdating.securityCode,
        cpf: cardUpdating.cpf,
        updated_at: knex.fn.now(),
      })
      .where({ id: cardUpdating.id, user_id });

    return res.status(201).json();
  }

  async delete(req, res) {
    const { id } = req.params;
    const user_id = req.user.id;

    const card = await knex("cards").where({ id, user_id }).first();

    if (!card) {
      throw new AppError("Cartão não encontrado", 404);
    }

    await knex("cards").delete().where({ id, user_id });

    return res.status(204).json();
  }
  async index(req, res) {
    const { nickname } = req.query;
    const user_id = req.user.id;

    const cards = await knex("cards")
      .where({ user_id })
      .andWhereLike("nickname", `%${nickname}%`);

    return res.status(200).json(cards);
  }
}

module.exports = CardsController;

const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class FeedbacksController {
  async create(req, res) {
    const { rating, comment } = req.body;
    const { order_id } = req.query;

    if (rating < 1 || rating > 5) {
      throw new AppError("Nota deve ser de 1 a 5");
    }

    await knex("feedbacks").insert({ rating, comment, order_id });

    return res.status(201).json();
  }
}

module.exports = FeedbacksController;

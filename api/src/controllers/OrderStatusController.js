const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class OrderStatusController {
  async update(req, res) {
    const { status } = req.body;

    const { id } = req.params;

    const order = await knex("orders").where({ id }).first();

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    await knex("orders")
      .update({
        status: status,
        updated_at: knex.fn.now(),
      })
      .where({ id: order.id });

    return res.status(200).json();
  }
}

module.exports = OrderStatusController;

// criar um controller que só admin e employee tem autorização
// fazer um histórico de todas as vendas e suas avaliações
// ou seja, inner join com orders, products e feedbacks.

const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class SalesController {
  async index(req, res) {
    const { rating, product, category, orderBy, descOrAsc } = req.query;

    let orders;

    if (rating) {
      orders = await knex("orders")
        .select(
          "orders.id",
          "orders.status",
          "orders.amount",
          "orders.paymentMethod",
          "orders.created_at",
          "orders.updated_at"
        )
        .distinct("orders.id")
        .orderBy("orders.updated_at", "desc")
        .where("feedbacks.rating", rating)
        .innerJoin("feedbacks", "orders.id", "feedbacks.order_id");
    } else {
      if (orderBy === "feedbacks") {
        orders = await knex("orders")
          .select(
            "orders.id",
            "orders.status",
            "orders.amount",
            "orders.paymentMethod",
            "orders.address_id",
            "orders.created_at",
            "orders.updated_at"
          )
          .distinct("orders.id")
          .orderBy("feedbacks.rating", descOrAsc)
          .innerJoin("feedbacks", "orders.id", "feedbacks.order_id");
      } else {
        orders = await knex("orders")
          .select(
            "orders.id",
            "orders.status",
            "orders.amount",
            "orders.paymentMethod",
            "orders.address_id",
            "orders.created_at",
            "orders.updated_at"
          )
          .distinct("orders.id")
          .orderBy("orders.updated_at", descOrAsc);
      }
    }

    const mapOrdersId = orders.map((order) => {
      return order.id;
    });

    let products;

    if (category) {
      products = await knex("products")
        .select(
          "products.id",
          "products.name",
          "products.description",
          "products.price",
          "products.image",
          "sales.order_id",
          "sales.quantity"
        )
        .distinct("products.id")
        .whereIn("sales.order_id", mapOrdersId)
        .andWhere("categories.name", category)
        .andWhereLike("products.name", `%${product}%`)
        .innerJoin("sales", "products.id", "sales.product_id")
        .innerJoin("categories", "products.id", "categories.product_id");
    } else {
      products = await knex("products")
        .select(
          "products.id",
          "products.name",
          "products.description",
          "products.price",
          "products.image",
          "sales.order_id",
          "sales.quantity"
        )
        .distinct("products.id")
        .whereIn("sales.order_id", mapOrdersId)
        .andWhereLike("products.name", `%${product}%`)
        .innerJoin("sales", "products.id", "sales.product_id")
        .innerJoin("categories", "products.id", "categories.product_id");
    }

    const categories = await knex("categories").select();

    const productsWithCategory = products.map((product) => {
      const [productsCategory] = categories.filter(
        (category) => category.product_id === product.id
      );

      return {
        ...product,
        category: productsCategory,
      };
    });

    const feedbacks = await knex("feedbacks");
    const addresses = await knex("addresses");

    const ordersWithProductsAndFeedbacks = orders.map((order) => {
      const orderProducts = productsWithCategory.filter(
        (productWithCategory) => productWithCategory.order_id === order.id
      );

      const [orderAddresses] = addresses.filter(
        (addresses) => addresses.id === order.address_id
      );

      const [orderFeedbacks] = feedbacks.filter(
        (feedback) => feedback.order_id === order.id
      );

      return {
        ...order,
        address: orderAddresses,
        feedback: orderFeedbacks,
        products: orderProducts,
      };
    });

    const filterOrdersWithProductsAndFeedbacks =
      ordersWithProductsAndFeedbacks.filter(
        (orderWithProductsAndFeedbacks) =>
          orderWithProductsAndFeedbacks.products.length > 0
      );

    return res.status(200).json(filterOrdersWithProductsAndFeedbacks);
  }

  async show(req, res) {
    const { id } = req.params;

    const order = await knex("orders")
      .select(
        "orders.id",
        "orders.status",
        "orders.amount",
        "orders.paymentMethod",
        "orders.created_at",
        "orders.updated_at"
      )
      .where({ id })
      .first();

    if (!order) {
      throw new AppError("Venda não encontrada!", 404);
    }

    const products = await knex("products")
      .select(
        "products.id",
        "products.name",
        "products.description",
        "products.price",
        "products.image",
        "sales.order_id",
        "sales.quantity"
      )
      .where("sales.order_id", order.id)
      .innerJoin("sales", "products.id", "sales.product_id")
      .innerJoin("categories", "products.id", "categories.product_id");

    const categories = await knex("categories").select();

    const productsWithCategory = products.map((product) => {
      const [productsCategory] = categories.filter(
        (category) => category.product_id === product.id
      );

      return {
        ...product,
        category: productsCategory,
      };
    });

    const feedback = await knex("feedbacks")
      .where({ order_id: order.id })
      .first();

    return res.status(200).json({
      ...order,
      feedback,
      products: productsWithCategory,
    });
  }
}

module.exports = SalesController;

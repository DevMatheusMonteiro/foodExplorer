const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class OrdersController {
  async create(req, res) {
    const { orders, paymentMethod } = req.body;
    const user_id = req.user.id;

    if (orders.length === 0) {
      throw new AppError("Nenhum pedido enviado!");
    }

    const quantity = {};
    const product_ids = [];

    orders.forEach((order) => {
      product_ids.push(order.product_id);
      quantity[order.product_id] = order.quantity;
    });

    const products = await knex("products")
      .select("id", "price")
      .whereIn("id", product_ids);

    product_ids.forEach((product_id) => {
      if (!products.some((product) => product.id === product_id)) {
        throw new AppError("Alguns produtos não foram encontrados", 404);
      }
    });

    const amount = products.reduce((amount, product) => {
      return product.price * quantity[product.id] + amount;
    }, 0);

    const [order_id] = await knex("orders").insert({
      paymentMethod,
      amount,
      user_id,
    });

    orders.forEach(async (order) => {
      await knex("sales").insert({
        quantity: order.quantity,
        product_id: order.product_id,
        order_id,
      });
    });

    return res.status(201).json();
  }

  async update(req, res) {
    const { rating, feedBack } = req.body;
    const { id } = req.params;
    const user_id = req.user.id;

    const order = await knex("orders").where({ id, user_id }).first();

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    if (rating < 1 || rating > 5) {
      throw new AppError("Avaliação deve ser de 1 a 5");
    }

    order.rating = rating ?? order.rating;
    order.feedBack = feedBack ?? order.feedBack;

    await knex("orders")
      .update({
        rating: order.rating,
        feedBack: order.feedBack,
        updated_at: knex.fn.now(),
      })
      .where({ id: order.id, user_id });

    return res.status(200).json();
  }

  async delete(req, res) {
    const { id } = req.params;

    const user_id = req.user.id;

    const order = await knex("orders").where({ id, user_id }).first();

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
    }

    await knex("orders").where({ id: order.id, user_id }).delete();

    return res.status(204).json();
  }

  async index(req, res) {
    const { search, category, rating } = req.query;
    const user_id = req.user.id;

    const orders = await knex("orders")
      .select(
        "orders.id",
        "orders.amount",
        "orders.paymentMethod",
        "orders.rating",
        "orders.feedBack",
        "orders.user_id",
        "orders.created_at",
        "orders.updated_at"
      )
      .distinct("id")
      .where("user_id", user_id)
      .andWhereLike("rating", `%${rating}%`);

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
        .where("categories.name", category)
        .whereIn("sales.order_id", mapOrdersId)
        .andWhereLike("products.name", `%${search}%`)
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
        .andWhereLike("products.name", `%${search}%`)
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

    const ordersWithProducts = orders.map((order) => {
      const orderProducts = productsWithCategory.filter(
        (productWithCategory) => productWithCategory.order_id === order.id
      );

      if (orderProducts.length > 0) {
        return {
          ...order,
          products: orderProducts,
        };
      } else {
      }
    });

    return res.status(200).json(ordersWithProducts);
  }

  async show(req, res) {
    const { id } = req.params;

    const product = await knex("products").where({ id }).first();

    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }

    const categories = await knex("categories").select();
    const ingredients = await knex("ingredients").select();

    const [productsCategory] = categories.filter(
      (category) => category.product_id === product.id
    );
    const productsIngredient = ingredients.filter(
      (ingredient) => ingredient.product_id === product.id
    );

    return res.status(200).json({
      ...product,
      category: productsCategory,
      ingredients: productsIngredient,
    });
  }
}

module.exports = OrdersController;

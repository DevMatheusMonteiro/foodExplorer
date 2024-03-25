const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class OrdersController {
  async create(req, res) {
    const { orders, paymentMethod, address_id } = req.body;
    const user_id = req.user.id;

    if (orders.length === 0) {
      throw new AppError("Nenhum pedido enviado!");
    }

    const address = await knex("addresses")
      .where({ id: address_id, user_id })
      .first();

    if (!address) {
      throw new AppError("Endereço não encontrado", 404);
    }

    await knex("addresses")
      .where({ user_id, selected: true })
      .update({ selected: false });

    await knex("addresses")
      .where({ id: address_id, user_id })
      .update({ selected: true, updated_at: knex.fn.now() });

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
      address_id,
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
    const { status } = req.query;

    const user_id = req.user.id;

    let orders;

    if (status === "delivered") {
      orders = await knex("orders")
        .select("*")
        .distinct("id")
        .where({ user_id })
        .andWhere({ status })
        .orderBy("updated_at", "desc")
        .limit(5);
    } else {
      orders = await knex("orders")
        .select("*")
        .distinct("id")
        .where({ user_id })
        .andWhereNot("status", "delivered")
        .orderBy("updated_at", "desc");
    }

    const mapOrdersId = orders.map((order) => {
      return order.id;
    });

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
      .distinct("products.id")
      .whereIn("sales.order_id", mapOrdersId)
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

    const addresses = await knex("addresses");

    const ordersWithProductsAndAddress = orders.map((order) => {
      const orderProducts = productsWithCategory.filter(
        (productWithCategory) => productWithCategory.order_id === order.id
      );

      const [orderAddresses] = addresses.filter(
        (addresses) => addresses.id === order.address_id
      );

      return {
        ...order,
        address: orderAddresses,
        products: orderProducts,
      };
    });

    return res.status(200).json(ordersWithProductsAndAddress);
  }

  async show(req, res) {
    const { id } = req.params;
    const user_id = req.user.id;

    const order = await knex("orders").where({ user_id, id }).first();

    if (!order) {
      throw new AppError("Pedido não encontrado", 404);
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

    const address = await knex("addresses")
      .where({
        user_id,
        id: order.address_id,
      })
      .first();

    return res.status(200).json({
      ...order,
      address,
      products: productsWithCategory,
    });
  }
}

module.exports = OrdersController;

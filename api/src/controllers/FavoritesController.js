const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class FavoritesController {
  async create(req, res) {
    const { product_id } = req.body;
    const user_id = req.user.id;

    const product = await knex("products").where({ id: product_id }).first();
    const favorite = await knex("favorites")
      .where({ product_id, user_id })
      .first();

    if (favorite) {
      throw new AppError("Este produto já está favoritado");
    }

    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }

    await knex("favorites").insert({ product_id, user_id });

    return res.status(200).json();
  }
  async delete(req, res) {
    const { id } = req.params;
    const user_id = req.user.id;

    const favorite = await knex("favorites").where({ id, user_id }).first();

    if (!favorite) {
      throw new AppError("Favorito não encontrado", 404);
    }

    await knex("favorites").delete().where({ id, user_id });

    return res.status(204).json();
  }
  async index(req, res) {
    const { search, category } = req.query;
    const user_id = req.user.id;

    let products;

    if (category) {
      products = await knex("products")
        .select(
          "products.id",
          "products.name",
          "products.description",
          "products.price",
          "products.image",
          "products.created_at",
          "products.updated_at"
        )
        .distinct("products.id")
        .where("favorites.user_id", user_id)
        .andWhere("categories.name", `${category}`)
        .andWhereLike("products.name", `%${search}%`)
        .orWhere("favorites.user_id", user_id)
        .andWhere("categories.name", `${category}`)
        .andWhereLike("ingredients.name", `%${search}%`)
        .innerJoin("ingredients", "products.id", "ingredients.product_id")
        .innerJoin("categories", "products.id", "categories.product_id")
        .innerJoin("favorites", "products.id", "favorites.product_id")
        .orderBy("products.name");
    } else {
      products = await knex("products")
        .select(
          "products.id",
          "products.name",
          "products.description",
          "products.price",
          "products.image",
          "products.created_at",
          "products.updated_at"
        )
        .distinct("products.id")
        .where("favorites.user_id", user_id)
        .andWhereLike("products.name", `%${search}%`)
        .orWhere("favorites.user_id", user_id)
        .andWhereLike("ingredients.name", `%${search}%`)
        .innerJoin("ingredients", "products.id", "ingredients.product_id")
        .innerJoin("categories", "products.id", "categories.product_id")
        .innerJoin("favorites", "products.id", "favorites.product_id")
        .orderBy("products.name");
    }

    const categories = await knex("categories").select();
    const ingredients = await knex("ingredients").select();

    const productsWithIngredientsAndCategory = products.map((product) => {
      const [productsCategory] = categories.filter(
        (category) => category.product_id === product.id
      );
      const productsIngredient = ingredients.filter(
        (ingredient) => ingredient.product_id === product.id
      );

      return {
        ...product,
        category: productsCategory,
        ingredients: productsIngredient,
      };
    });

    return res.status(200).json(productsWithIngredientsAndCategory);
  }
}

module.exports = FavoritesController;

const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class ProductsController {
  async create(req, res) {
    const { name, description, price, category, ingredients } = req.body;

    const checkProductExists = await knex("products").where({ name }).first();

    if (checkProductExists) {
      throw new AppError("Este produto já está cadastrado!");
    }

    if (!category) {
      throw new AppError("É necessário informar a categoria do produto!");
    }

    if (!price) {
      throw new AppError("É necessário informar o preço do produto!");
    }

    if (ingredients.length === 0) {
      throw new AppError("Coloque ao menos um ingrediente");
    }

    const [product_id] = await knex("products").insert({
      name,
      description,
      price,
    });

    await knex("categories").insert({ name: category, product_id });

    if (ingredients.length > 0) {
      const ingredientsInsert = ingredients.map((ingredient) => {
        return {
          name: ingredient,
          product_id,
        };
      });

      await knex("ingredients").insert(ingredientsInsert);
    }

    return res.status(201).json();
  }

  async update(req, res) {
    const { name, description, price, category, ingredients } = req.body;
    const { id } = req.params;

    const product = await knex("products").where({ id }).first();

    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }

    if (name) {
      const productUpdate = await knex("products").where({ name }).first();

      if (productUpdate && productUpdate.id !== product.id) {
        throw new AppError("Produto já cadastrado!");
      }
    }

    if (ingredients) {
      const originalIngredients = await knex("ingredients").where({
        product_id: id,
      });

      const namesOfOriginalIngredients = [];

      originalIngredients.forEach(async (originalIngredient) => {
        namesOfOriginalIngredients.push(originalIngredient.name);

        if (!ingredients.includes(originalIngredient.name)) {
          await knex("ingredients")
            .where({
              product_id: id,
              name: originalIngredient.name,
            })
            .delete();
        }
      });

      const newIngredients = [];
      const sameIngredients = [];

      ingredients.forEach(async (ingredient) => {
        if (!namesOfOriginalIngredients.includes(ingredient)) {
          newIngredients.push({ name: ingredient, product_id: product.id });
        } else {
          sameIngredients.push(ingredient);
        }
      });

      if (newIngredients.length === 0 && sameIngredients.length === 0) {
        throw new AppError("Coloque ao menos um ingrediente");
      }

      if (newIngredients.length > 0) {
        await knex("ingredients").insert(newIngredients);
      }
    }

    if (category) {
      const originalCategory = await knex("categories")
        .where({ name: category, product_id: id })
        .first();

      if (!originalCategory) {
        await knex("categories")
          .where({
            product_id: id,
          })
          .delete();

        await knex("categories").insert({ name: category, product_id: id });
      }
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;

    await knex("products")
      .update({
        name: product.name,
        description: product.description,
        price: product.price,
        updated_at: knex.fn.now(),
      })
      .where({ id: product.id });

    return res.status(200).json();
  }

  async delete(req, res) {
    const { id } = req.params;

    const product = await knex("products").where({ id }).first();

    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }

    await knex("products").where({ id: product.id }).delete();

    return res.status(204).json();
  }

  async index(req, res) {
    const { search, category } = req.query;

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
        .where("categories.name", `${category}`)
        .andWhereLike("products.name", `%${search}%`)
        .orWhere("categories.name", `${category}`)
        .andWhereLike("ingredients.name", `%${search}%`)
        .innerJoin("ingredients", "products.id", "ingredients.product_id")
        .innerJoin("categories", "products.id", "categories.product_id")
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
        .whereLike("products.name", `%${search}%`)
        .orWhereLike("ingredients.name", `%${search}%`)
        .innerJoin("ingredients", "products.id", "ingredients.product_id")
        .innerJoin("categories", "products.id", "categories.product_id")
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

module.exports = ProductsController;

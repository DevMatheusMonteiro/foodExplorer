const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class ProductsImageController {
  async update(req, res) {
    const { id } = req.params;

    const product = await knex("products").where({ id }).first();

    if (!product) {
      throw new AppError("Produto não encontrado", 404);
    }

    const imageFilename = req.file.filename;

    const diskStorage = new DiskStorage();

    if (product.image) {
      await diskStorage.deleteFile(product.image);
    }

    const filename = await diskStorage.saveFile(imageFilename);

    product.image = filename;

    await knex("products")
      .update({ image: product.image, updated_at: knex.fn.now() })
      .where({ id });

    return res.status(200).json({ image: product.image });
  }
}

module.exports = ProductsImageController;

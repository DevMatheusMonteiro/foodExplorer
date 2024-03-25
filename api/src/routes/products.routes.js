const Router = require("express");

const ProductsController = require("../controllers/ProductsController");
const ProductsImageController = require("../controllers/ProductsImageController");

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");

const multer = require("multer");
const upload = require("../configs/upload");

const productsRoutes = Router();

const productsController = new ProductsController();
const productsImageController = new ProductsImageController();

const uploadConfig = multer(upload.MULTER);

productsRoutes.use(ensureAuthenticated);

productsRoutes.get("/", productsController.index);
productsRoutes.get("/:id", productsController.show);

productsRoutes.use(verifyUserAuthorization(["admin", "employee"]));

productsRoutes.post("/", productsController.create);
productsRoutes.put("/:id", productsController.update);
productsRoutes.delete("/:id", productsController.delete);
productsRoutes.patch(
  "/:id/image",
  uploadConfig.single("image"),
  productsImageController.update
);

module.exports = productsRoutes;

const Router = require("express");

const AddressesController = require("../controllers/AddressesController");

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const categoriesRoutes = Router();

const addressesController = new AddressesController();

categoriesRoutes.use(ensureAuthenticated);

categoriesRoutes.post("/", addressesController.create);
categoriesRoutes.get("/", addressesController.index);
categoriesRoutes.get("/:id", addressesController.show);
categoriesRoutes.put("/:id", addressesController.update);
categoriesRoutes.delete("/:id", addressesController.delete);

module.exports = categoriesRoutes;

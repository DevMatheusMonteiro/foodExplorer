const Router = require("express");

const SalesController = require("../controllers/SalesController");

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");

const salesRoutes = Router();

const salesController = new SalesController();

salesRoutes.use(ensureAuthenticated);

salesRoutes.use(verifyUserAuthorization(["admin", "employee"]));
salesRoutes.get("/", salesController.index);
salesRoutes.get("/:id", salesController.show);

module.exports = salesRoutes;

const Router = require("express");

const OrdersController = require("../controllers/OrdersController");

const OrderStatusController = require("../controllers/OrderStatusController");

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const ordersRoutes = Router();

const ordersController = new OrdersController();
const orderStatusController = new OrderStatusController();

ordersRoutes.use(ensureAuthenticated);

ordersRoutes.post("/", ordersController.create);

ordersRoutes.get("/", ordersController.index);

ordersRoutes.get("/:id", ordersController.show);

ordersRoutes.delete("/:id", ordersController.delete);

ordersRoutes.patch("/:id", orderStatusController.update);

module.exports = ordersRoutes;

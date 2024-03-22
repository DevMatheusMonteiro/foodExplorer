const { Router } = require("express");

const usersRouter = require("./users.routes");
const sessionsRouter = require("./sessions.routes");
const productsRouter = require("./products.routes");
const categoriesRouter = require("./categories.routes");
const ordersRouter = require("./orders.routes");

const routes = Router();

routes.use("/users", usersRouter);
routes.use("/sessions", sessionsRouter);
routes.use("/products", productsRouter);
routes.use("/categories", categoriesRouter);
routes.use("/orders", ordersRouter);

module.exports = routes;

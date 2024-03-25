const { Router } = require("express");

const usersRouter = require("./users.routes");
const sessionsRouter = require("./sessions.routes");
const productsRouter = require("./products.routes");
const categoriesRouter = require("./categories.routes");
const ordersRouter = require("./orders.routes");
const addressesRouter = require("./addresses.routes");
const feedbacksRouter = require("./feedbacks.routes");
const salesRouter = require("./sales.routes");
const favoritesRouter = require("./favorites.routes");
const cardsRouter = require("./cards.routes");

const routes = Router();

routes.use("/users", usersRouter);
routes.use("/sessions", sessionsRouter);
routes.use("/products", productsRouter);
routes.use("/categories", categoriesRouter);
routes.use("/orders", ordersRouter);
routes.use("/addresses", addressesRouter);
routes.use("/feedbacks", feedbacksRouter);
routes.use("/sales", salesRouter);
routes.use("/favorites", favoritesRouter);
routes.use("/cards", cardsRouter);

module.exports = routes;

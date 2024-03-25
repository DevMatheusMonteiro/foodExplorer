const Router = require("express");

const CardsController = require("../controllers/CardsController");

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const cardsRoutes = Router();

const cardsController = new CardsController();

cardsRoutes.use(ensureAuthenticated);

cardsRoutes.post("/", cardsController.create);
cardsRoutes.get("/", cardsController.index);
cardsRoutes.put("/:id", cardsController.update);
cardsRoutes.delete("/:id", cardsController.delete);

module.exports = cardsRoutes;

const Router = require("express");

const FeedbacksController = require("../controllers/FeedbacksController");

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const feedbacksRoutes = Router();

const feedbacksController = new FeedbacksController();

feedbacksRoutes.use(ensureAuthenticated);

feedbacksRoutes.post("/", feedbacksController.create);

module.exports = feedbacksRoutes;

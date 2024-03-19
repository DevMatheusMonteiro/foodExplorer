const Router = require("express");

const UsersController = require("../controllers/UsersController");
const UserValidationController = require("../controllers/UserValidationController");
const EmployeesUserController = require("../controllers/EmployeesUserController");

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");

const usersRoutes = Router();

const usersController = new UsersController();
const userValidationController = new UserValidationController();
const employeesUserController = new EmployeesUserController();

usersRoutes.post("/", usersController.create);

usersRoutes.use(ensureAuthenticated);

usersRoutes.put("/", usersController.update);
usersRoutes.delete("/", usersController.delete);

usersRoutes.get("/validate", userValidationController.show);

usersRoutes.use(verifyUserAuthorization(["admin"]));

usersRoutes.get("/employee", employeesUserController.index);
usersRoutes.get("/employee/:id", employeesUserController.show);
usersRoutes.post("/employee", employeesUserController.create);
usersRoutes.put("/employee", employeesUserController.update);
usersRoutes.delete("/employee/:id", employeesUserController.delete);

module.exports = usersRoutes;

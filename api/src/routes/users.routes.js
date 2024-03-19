const Router = require("express");

const UsersController = require("../controllers/UsersController");
const UserValidationController = require("../controllers/UserValidationController");
const EmployeeUsersController = require("../controllers/EmployeeUsersController");

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");

const usersRoutes = Router();

const usersController = new UsersController();
const userValidationController = new UserValidationController();
const employeeUsersController = new EmployeeUsersController();

usersRoutes.post("/", usersController.create);

usersRoutes.use(ensureAuthenticated);

usersRoutes.put("/", usersController.update);
usersRoutes.delete("/", usersController.delete);

usersRoutes.get("/validate", userValidationController.show);

usersRoutes.use(verifyUserAuthorization(["admin"]));

usersRoutes.post("/employee", employeeUsersController.create);
usersRoutes.get("/employee", employeeUsersController.index);
usersRoutes.get("/employee/:id", employeeUsersController.show);
usersRoutes.put("/employee/:id", employeeUsersController.update);
usersRoutes.delete("/employee/:id", employeeUsersController.delete);

module.exports = usersRoutes;

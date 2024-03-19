const AppError = require("../utils/AppError");

function verifyUserAuthorization(rolesToVerify) {
  return (req, res, next) => {
    const { role } = req.user;

    if (!rolesToVerify.includes(role)) {
      throw new AppError("Unauthorized", 401);
    }

    return next();
  };
}

module.exports = verifyUserAuthorization;

const { verify } = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const { jwt } = require("../configs/auth");

function ensureAuthenticated(req, res, next) {
  const { token } = req.cookies;

  if (!token) {
    throw new AppError("JWT Token não informado", 401);
  }

  try {
    const { role, sub: user_id } = verify(token, jwt.secret);

    req.user = {
      id: Number(user_id),
      role,
    };

    return next();
  } catch {
    throw new AppError("Invalid JWT Token", 401);
  }
}

module.exports = ensureAuthenticated;

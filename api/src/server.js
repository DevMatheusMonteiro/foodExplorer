require("express-async-errors");

const express = require("express");
const routes = require("./routes");
const AppError = require("./utils/AppError");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(
  cookieParser("ae7573de0e7fecf88daac906d6134d93", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    maxAge: 30 * 60 * 1000,
  })
);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use(routes);

app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  console.log(err);

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

const PORT = 3333;
app.listen(PORT, () => console.log(`Server is running on Port: ${PORT}`));

const cookieParser = require("cookie-parser");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./src/routes/user.routes");
const courseRoutes = require("./src/routes/course.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const miscRoutes =require("./src/routes/miscellaneous.routes")
const morgan = require("morgan");
const errorMiddleware = require("./src/middleware/error.middleware");

const app = express();

//& middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// FRONTEND_URL
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());

//& api routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1",miscRoutes)

//& ─── error middleware ───────────────────────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;

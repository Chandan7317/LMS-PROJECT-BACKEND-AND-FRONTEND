const errorMiddleware = (err, req, res, next) => {
  // console.log("error middlewere called", err);

  //& ─── ValidationError ────────────────────────────────────────────────────────────────
  //   if (err.name === "ValidationError") {
  //     err.message = Object.values(err.errors)
  //       .map((err) => err.message)
  //       .join(", ");
  //     err.statusCode = 400;
  //   }

  //  &  ---------  ----------

  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Something went wrong";

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    // errObject: err,
    stack: err.stack,
  });
};

module.exports = errorMiddleware;

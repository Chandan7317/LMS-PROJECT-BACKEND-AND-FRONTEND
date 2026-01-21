const ErrorHandler = require("../utils/ErrorHandler.utils");
const jwt = require("jsonwebtoken");
const AsyncHandler = require("express-async-handler");
const myCollection = require("../models/user.model");


// !  isLoggedIn
const isLoggedIn = async (req, _res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(
      new ErrorHandler("Unauthorized, please login to continue", 400)
    );
  }

  const userDetails = await jwt.verify(token, process.env.JWT_SECRET);

  req.user = userDetails;

  next();
};

//! Middleware to check if user is admin or not

const authorizeRoles = (...roles) =>
  AsyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler("You do not have permission to view this route", 404)
      );
    }
    next();
  });

  // ! Middleware to check if user has an active subscription or not
  const authorizeSubscribers = AsyncHandler(async (req, _res, next) => {
  // If user is not admin or does not have an active subscription then error else pass
  const user= await myCollection.findById(req.user.id)
  if (user.role !== "ADMIN" && user.subscription.status !== "active") {
    return next(new AppError("Please subscribe to access this route.", 403));
  }

  next();
});


module.exports = {
  isLoggedIn,
  authorizeRoles,
  authorizeSubscribers,
};

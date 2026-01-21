const AsyncHandler = require("express-async-handler");
const ErrorHandler = require("../utils/ErrorHandler.utils");
const myCollection = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");

/**
 * @CONTACT_US
 * @ROUTE @POST {{URL}}/api/v1/contact
 * @ACCESS Public
 */
const contactUs = AsyncHandler(async (req, res, next) => {
  // Destructuring the required data from req.body
  const { name, email, message } = req.body;

  // Checking if values are valid
  if (!name || !email || !message) {
    return next(new ErrorHandler("Name, Email, Message are required"));
  }

  try {
    const subject = "Contact Us Form";
    const textMessage = `${name} - ${email} <br /> ${message}`;

    // Await the send email
    await sendEmail(process.env.CONTACT_US_EMAIL, subject, textMessage);

  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(error.message, 400));
  }

  res.status(200).json({
    success: true,
    message: "Your request has been submitted successfully",
  });
});

/**
 * @USER_STATS_ADMIN
 * @ROUTE @GET {{URL}}/api/v1/admin/stats/users
 * @ACCESS Private(ADMIN ONLY)
 */
const userStats = AsyncHandler(async (req, res, next) => {
  const allUsersCount = await myCollection.countDocuments();

  const subscribedUsersCount = await myCollection.countDocuments({
    "subscription.status": "active", // subscription.status means we are going inside an object and we have to put this in quotes
  });

  res.status(200).json({
    success: true,
    message: "All registered users count",
    allUsersCount,
    subscribedUsersCount,
  });
});

module.exports = {
  contactUs,
  userStats,
};

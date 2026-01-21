const myCollection = require("../models/user.model");
const fs = require("fs").promises;
const cloudinary = require("cloudinary");
const ApiResponse = require("../utils/ApiResponse.utils");
const ErrorHandler = require("../utils/ErrorHandler.utils");
const AsyncHandler = require("express-async-handler");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// ! cookieOptions
const cookieOptions = {
  secure: process.env.NODE_ENV === "production" ? true : false,
  maxAge: 7 * 24 * 60 * 60 * 1000, //7 day
  httpOnly: true,
};

// &----------------------------- Register User--------------------------------

const register = AsyncHandler(async (req, res, next) => {
  // Destructuring the necessary data from req object
  const { fullName, email, password } = req.body;

  // Check if the data is there or not, if not throw error message
  if (!fullName || !email || !password) {
    return next(new ErrorHandler("all fields required", 400));
  }

  // Check if the user exists with the provided email
  const userExits = await myCollection.findOne({ email });
  if (userExits) {
    return next(new ErrorHandler("emial already exits", 409));
  }

  // Create new user with the given necessary data and save to DB
  const user = await myCollection.create({
    fullName,
    email,
    password,
    avatar: {
      public_id: email,
      secure_url:
        "https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg",
    },
  });

  if (!user) {
    return next(
      new ErrorHandler("User reqistration fieled, please try agian later", 400),
    );
  }

  // & TODO :File upload

  // ^ Run only if user sends a file
  if (req.file) {
    // console.log("image Upload =>",req.file);

    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms", //Save file in a folder named lms
        width: 250,
        height: 250,
        gravity: "faces", // This option tells cloudinary to center the image around detected faces (if any )or resizing the original image
        crop: "fill",
      });

      // If success
      if (result) {
        //  Set the  public_id and secure_url in DB
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // After successful upload remove the file from local storage
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (error) {
      return next(
        new ErrorHandler(error, "File not uploads, please try again", 400),
      );
    }
  }

  // Save the user object
  await user.save();

  // Generating a JWT token
  const token = await user.generateJWTToken();

  // Setting the password to undefined so it does not get sent in the response
  user.password = undefined;

  // Setting the token in the cookie with name token along with cookieOptions
  res.cookie("token", token, cookieOptions);

  // If all good send the response to the frontend
  new ApiResponse(200, true, "User registered successfully", user).send(res);
});

// & ------------------------------Login ---------------------------------------

const login = AsyncHandler(async (req, res, next) => {
  // Destructuring the necessary data from req object
  const { email, password } = req.body;
  // Check if the data is there or not, if not throw error message

  if (!email || !password) {
    return next(new ErrorHandler("Email and Password are required", 400));
  }

  // Finding the user with the sent email
  const user = await myCollection.findOne({ email }).select("+password");
  // If no user or sent password do not match then send generic response
  if (!(user && (await user.comparePassword(password)))) {
    return next(
      new ErrorHandler(
        "Email or Password do not match or user does not exist",
        400,
      ),
    );
  }

  // Generating a JWT token
  const token = await user.generateJWTToken();

  // Setting the password to undefined so it does not get sent in the response
  user.password = undefined;

  // Setting the token in the cookie with name token along with cookieOptions
  res.cookie("token", token, cookieOptions);

  // If all good send the response to the frontend
  new ApiResponse(200, true, "User logged in successfully", user).send(res);
});

// & -----------------------------Logout----------------------------------------
const logout = AsyncHandler(async (req, res, next) => {
  // Setting the cookie value to null
  res.cookie("token", null, {
    secure: process.env.NODE_ENV === "production" ? true : false,
    maxAge: 0,
    httpOnly: true,
  });

  // Sending the response
  new ApiResponse(200, true, "User logged out successfully").send(res);
});

// &-----------------------------GetProfile---------------------------------------
const getProfile = AsyncHandler(async (req, res, next) => {
  // Finding the user using the id from modified req object
  const userId = req.user.id;
  const user = await myCollection.findById(userId);
  new ApiResponse(200, true, "User details", user).send(res);

  // return next(new ErrorHandler("Failed to fetch Profile details", 500));
});

// & ----------------------------ForgotPassword-------------------------------
const forgotPassword = AsyncHandler(async (req, res, next) => {
  // Extracting email from request body
  const { email } = req.body;
  // If no email send email required message
  if (!email) {
    return next(new ErrorHandler("Email is require", 400));
  }

  // Finding the user via email
  const user = await myCollection.findOne({ email });
  // If no email found send the message email not found
  if (!user) {
    return next(new ErrorHandler("Email not reqistered", 404));
  }

  // Generating the reset token via the method we have in user model
  const resetToken = await user.generatePasswardResetToken();

  // Saving the forgotPassword* to DB
  await user.save();

  // constructing a url to send the correct data
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  console.log("resetPasswordUrl", resetPasswordUrl);

  // We here need to send an email to the user with the token
  const subject = "Reset Password";
  const message = `You can reset your Password by clicking <a href=${resetPasswordUrl} target="_blank">Reset Your Password</a>\n If the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this ,Kindly ignore.`;

  try {
    await sendEmail(email, subject, message);

    // If email sent successfully send the success response
    new ApiResponse(
      200,
      true,
      `Reset password token has been sent to ${email} successfully`,
    ).send(res);
  } catch (error) {
    // If some error happened we need to clear the forgotPassword* fields in our DB
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();
    new ErrorHandler(
      error.message || "Something went wrong, please try again.",
      500,
    );
  }
});

// &----------------------------ResetPassword--------------------------------
const resetPassword = AsyncHandler(async (req, res, next) => {
  // Extracting resetToken from req.params object
  const { resetToken } = req.params;
  // Extracting password from req.body object
  const { password } = req.body;
  // We are again hashing the resetToken using sha256 since we have stored our resetToken in DB using the same algorithm
  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Check if password is not there then send response saying password is required
  if (!password) {
    return next(new ErrorHandler("Password is required", 400));
  }
  console.log(forgotPasswordToken);

  // Checking if token matches in DB and if it is still valid(Not expired)
  const user = await myCollection.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() }, // $gt will help us check for greater than value, with this we can check if token is valid or expired
  });

  // If not found or expired send the response
  if (!user) {
    return next(
      new ErrorHandler("Token is invalid or expired, please try again", 400),
    );
  }

  // Update the password if token is valid and not expired
  user.password = password;

  // making forgotPassword* valus undefined in the DB
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  // Saving the updated user values

  await user.save();

  // Sending the response when everything goes good
  new ApiResponse(200, true, "Password changed successfully").send(res);
});

// & ---------------------------changePassword-------------------------------
const changePassword = AsyncHandler(async (req, res, next) => {
  // Destructuring the necessary data from the req object
  const { oldPassword, newPassword } = req.body;
  const { id } = req.user; // because of the middleware isLoggedIn

  // Check if the values are there or not
  if (!oldPassword || !newPassword) {
    return next(
      new ErrorHandler("Old password and new password are required", 400),
    );
  }

  // Finding the user by ID and selecting the password
  const user = await myCollection.findById(id).select("+password");

  // If no user then throw an error message
  if (!user) {
    return next(
      new ErrorHandler("Invalid user id or user does not exist", 400),
    );
  }

  // Check if the old password is correct
  const isPasswordValid = await user.comparePassword(oldPassword);

  // If the old password is not valid then throw an error message
  if (!isPasswordValid) {
    return next(new ErrorHandler("Invalid old password", 400));
  }

  // Setting the new password
  user.password = newPassword;

  // Save the data in DB
  await user.save();

  // Setting the password undefined so that it won't get sent in the response
  user.password = undefined;

  new ApiResponse(200, true, "Password changed successfully").send(res);
});

// & --------------------------UpdateUser-----------------------------------
const updateUser = AsyncHandler(async (req, res, next) => {
  // Destructuring the necessary data from the req object
  const { fullName } = req.body;
  const { id } = req.params;

  const user = await myCollection.findById(id);

  if (!user) {
    return next(
      new ErrorHandler("Invalid user id or user does not exist", 400),
    );
  }

  if (fullName) {
    user.fullName = fullName;
  }

  // Run only if user sends a file
  if (req.file) {
    // Deletes the old image uploaded by the user
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms", // Save files in a folder named lms
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
      });

      //if success
      if (result) {
        // Set the public_id and secure_url in DB
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // After successful upload remove the file from local storage
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (error) {
      return next(
        new ErrorHandler(error || "File not uploaded, please try again", 400),
      );
    }
  }

  //save the user object
  await user.save();

  new ApiResponse(200, true, "User details updated successfully").send(res);
});

module.exports = {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser,
};

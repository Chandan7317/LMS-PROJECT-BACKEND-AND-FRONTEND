const { Router } = require("express");
const {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser
} = require("../controller/user.controller");
const { isLoggedIn } = require("../middleware/outh.middleware");
const upload = require("../middleware/multer.middleware");

const router = Router();

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", isLoggedIn, getProfile);
router.post("/reset",forgotPassword)
router.post("/reset/:resetToken",resetPassword)
router.post("/change-password",isLoggedIn,changePassword)
router.put("/update/:id",isLoggedIn,upload.single("avatar"),updateUser)


module.exports = router;

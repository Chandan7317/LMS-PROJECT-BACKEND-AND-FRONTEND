const { Router } = require("express");
const {
  contactUs,
  userStats,
} = require("../controller/miscellaneous.controller");
const { isLoggedIn, authorizeRoles } = require("../middleware/outh.middleware");

const router = Router();

// {{URL}}/api/v1/
router.route("/contact").post(contactUs);
router
  .route("/admin/stats/users")
  .get(isLoggedIn, authorizeRoles("ADMIN"), userStats);

module.exports = router;

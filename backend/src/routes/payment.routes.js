const { Router } = require("express");
const { isLoggedIn, authorizeRoles } = require("../middleware/outh.middleware");
const {
  verifySubscription,
  buySubscription,
  cancelSubscription,
  getRazorpayApiKey,
  allPayments,
} = require("../controller/payment.controller");

const router = Router();

router.route("/razorpay-key").get(isLoggedIn, getRazorpayApiKey);
router.route("/subscribe").post(isLoggedIn, buySubscription);
router.route("/verify").post(isLoggedIn, verifySubscription);
router.route("/unsubscribe").post(isLoggedIn, cancelSubscription);
router.route("/").get(isLoggedIn, authorizeRoles("ADMIN"), allPayments);

module.exports = router;

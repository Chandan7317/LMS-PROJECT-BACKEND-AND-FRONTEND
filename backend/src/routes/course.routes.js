const { Router } = require("express");
const { isLoggedIn, authorizeRoles, authorizeSubscribers } = require("../middleware/outh.middleware");

const {
  getAllCourses,
  getLecturesByCourseId,
  createCourse,
  updateCourseById,
  deleteCourseById,
  addLectureToCourseById,
  removeLectureFromCourse,
} = require("../controller/course.controller");
const upload = require("../middleware/multer.middleware");

const router = Router();

router
  .route("/")
  .get(getAllCourses)
  .post(
    isLoggedIn,
    authorizeRoles("ADMIN"),
    upload.single("thumbnail"),
    createCourse
  )
  .delete(isLoggedIn, authorizeRoles("ADMIN"), removeLectureFromCourse);

router
  .route("/:id")
  .get(isLoggedIn, authorizeSubscribers ,getLecturesByCourseId) // Added authorizeSubscribers to check if user is admin or subscribed if not then forbid the access to the lectures
  .put(isLoggedIn, authorizeRoles("ADMIN"), updateCourseById)
  .delete(isLoggedIn, authorizeRoles("ADMIN"), deleteCourseById)
  .post(
    isLoggedIn,
    authorizeRoles("ADMIN"),
    upload.single("lecture"),
    addLectureToCourseById
  );

module.exports = router;


import express from "express";
import { getUserProfile, login, logout, register, updateProfile,deleteProfile, getAllUsers} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";
import isinstructor from "../middlewares/isinstructor.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated, upload.single("profilePhoto"), updateProfile);
router.delete("/delete-profile", isAuthenticated, deleteProfile)

router.route("/all-users").get(isAuthenticated, getAllUsers);

// Instructors can delete any profile by ID
router.delete("/delete-user/:userId", isAuthenticated, isinstructor, deleteProfile);
export default router;
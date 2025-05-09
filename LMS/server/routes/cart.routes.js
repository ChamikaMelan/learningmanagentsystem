import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
  getCartItems, 
  addToCart, 
  removeFromCart, 
  clearCart, 
  createCartCheckoutSession,
  getCartCount
} from "../controllers/cart.controller.js";

const router = express.Router();

// Cart routes
router.route("/").get(isAuthenticated, getCartItems);
router.route("/add").post(isAuthenticated, addToCart);
router.route("/remove/:courseId").delete(isAuthenticated, removeFromCart);
router.route("/clear").delete(isAuthenticated, clearCart);
router.route("/checkout").post(isAuthenticated, createCartCheckoutSession);
router.route("/count").get(isAuthenticated, getCartCount);

export default router;
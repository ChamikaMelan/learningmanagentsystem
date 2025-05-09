import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCheckoutSession,getTotalTransactionCount,getStripeTransactions, getAllPurchasedCourse, stripeWebhook, getCourseDetailWithPurchaseStatus,getSuccessfulPaymentCount,getStripeBalance } from "../controllers/coursePurchase.controller.js";

const router = express.Router();

router.route("/checkout/create-checkout-session").post(isAuthenticated, createCheckoutSession);
router.route("/course/:courseId/detail-with-status").get(isAuthenticated,getCourseDetailWithPurchaseStatus);
router.route("/webhook").post(express.raw({type:"application/json"}), stripeWebhook);
router.route("/").get(isAuthenticated,getAllPurchasedCourse);


router.route('/transactions').get(getStripeTransactions);
router.route("/successful-count").get(getSuccessfulPaymentCount);
router.route('/balance').get(getStripeBalance);
router.route('/transaction-count').get(getTotalTransactionCount);
export default router;


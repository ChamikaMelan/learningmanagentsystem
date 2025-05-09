import Stripe from "stripe";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    const user = await User.findById(userId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    // Create a new course purchase record
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      userEmail: user.email, 
      amount: course.coursePrice,
      status: "pending",
    });

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: user.email, // Optionally pre-fill email in Stripe checkout
      line_items: [
        {
          price_data: {
            currency: "lkr",
            product_data: {
              name: course.courseTitle,
              images: [course.courseThumbnail],
            },
            unit_amount: course.coursePrice * 100, // Amount in paise (lowest denomination)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/course-progress/${courseId}`, 
      cancel_url: `http://localhost:5173/course-detail/${courseId}`,
      metadata: {
        courseId: courseId,
        userId: userId,
        userEmail: user.email,
      },
    });

    if (!session.url) {
      return res
        .status(400)
        .json({ success: false, message: "Error while creating session" });
    }

    // Save the purchase record with the session ID
    newPurchase.paymentId = session.id;
    await newPurchase.save();

    return res.status(200).json({
      success: true,
      url: session.url,
      status: "completed" // Return the Stripe checkout URL
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    const purchased = await CoursePurchase.findOne({ userId, courseId });
    console.log(purchased);

    if (!course) {
      return res.status(404).json({ message: "course not found!" });
    }

    return res.status(200).json({
      course,
      purchased: !!purchased, // true if purchased, false otherwise
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPurchasedCourse = async (_, res) => {
  try {
    const purchasedCourse = await CoursePurchase.find({
      status: "completed",
    }).populate("courseId");
    if (!purchasedCourse) {
      return res.status(404).json({
        purchasedCourse: [],
      });
    }
    return res.status(200).json({
      purchasedCourse,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getSuccessfulPaymentCount = async (_, res) => {
  try {
    const count = await CoursePurchase.countDocuments({ status: "pending" });
    return res.status(200).json({ count });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getStripeBalance = async (_, res) => {
  try {
    const balance = await stripe.balance.retrieve();
    
    // Find USD balance
    const usdBalance = {
      available: balance.available.find(b => b.currency === 'usd')?.amount || 0,
      pending: balance.pending.find(b => b.currency === 'usd')?.amount || 0
    };

    res.status(200).json({
      success: true,
      balance: {
        available: usdBalance.available / 100, // Convert cents to dollars
        pending: usdBalance.pending / 100
      }
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({ success: false, message: 'Error fetching balance' });
  }
};

// Helper function to process successful payments
export const handlePaymentCompletion = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    const purchase = await CoursePurchase.findOne({
      paymentId: sessionId,
    }).populate({ path: "courseId" });

    if (!purchase) {
      console.error("Purchase not found for session:", sessionId);
      return false;
    }

    if (session.amount_total) {
      purchase.amount = session.amount_total / 100;
    }
    purchase.status = "completed";
    purchase.userEmail = session.metadata.userEmail || purchase.userEmail;

    // Make all lectures visible by setting `isPreviewFree` to true
    if (purchase.courseId && purchase.courseId.lectures && purchase.courseId.lectures.length > 0) {
      await Lecture.updateMany(
        { _id: { $in: purchase.courseId.lectures } },
        { $set: { isPreviewFree: true } }
      );
    }

    await purchase.save();

    // Update user's enrolledCourses
    await User.findByIdAndUpdate(
      purchase.userId,
      { $addToSet: { enrolledCourses: purchase.courseId._id } },
      { new: true }
    );

    // Update course to add user ID to enrolledStudents
    await Course.findByIdAndUpdate(
      purchase.courseId._id,
      { $addToSet: { enrolledStudents: purchase.userId } },
      { new: true }
    );
    
    return true;
  } catch (error) {
    console.error("Error handling payment completion:", error);
    return false;
  }
};

export const checkSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Session ID is required" });
    }
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === "paid") {
      // Process the completed payment
      const success = await handlePaymentCompletion(sessionId);
      
      return res.status(200).json({
        success: true,
        status: session.payment_status,
        processed: success
      });
    }
    
    return res.status(200).json({
      success: true,
      status: session.payment_status
    });
  } catch (error) {
    console.error("Session check error:", error);
    return res.status(500).json({ success: false, message: "Error checking session status" });
  }
};

// FIXED WEBHOOK HANDLER - This was the main issue
export const stripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.WEBHOOK_ENDPOINT_SECRET;
  
  if (!signature || !webhookSecret) {
    console.error('Missing webhook signature or secret');
    return res.status(400).json({ success: false, message: 'Webhook Error: Missing signature or secret' });
  }
  
  let event;
  
  try {
    // Use the raw body directly rather than stringifying and parsing again
    // This requires the raw body to be preserved in your Express middleware setup
    const payload = req.rawBody || req.body;
    
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error(`Webhook Error: ${error.message}`);
    return res.status(400).json({ success: false, message: `Webhook Error: ${error.message}` });
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    console.log("Checkout session completed webhook received:", event.id);
    
    try {
      const session = event.data.object;
      
      // Find the purchase by session ID
      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
      }).populate({ path: "courseId" });

      if (!purchase) {
        console.error("Purchase not found for session:", session.id);
        return res.status(404).json({ success: false, message: "Purchase not found" });
      }

      // Update purchase details
      if (session.amount_total) {
        purchase.amount = session.amount_total / 100;
      }
      purchase.status = "completed";
      purchase.userEmail = session.metadata?.userEmail || purchase.userEmail;

      // Make all lectures visible by setting `isPreviewFree` to true
      if (purchase.courseId && purchase.courseId.lectures && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

      // Update user's enrolledCourses
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } },
        { new: true }
      );

      // Update course to add user ID to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } },
        { new: true }
      );
      
      console.log("Payment processed successfully for session:", session.id);
    } catch (error) {
      console.error("Error handling checkout.session.completed event:", error);
      // Still return 200 to Stripe to acknowledge receipt of the webhook
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return res.status(200).json({ received: true });
};

export const getStripeTransactions = async (_, res) => {
  try {
    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
      expand: ["data.payment_intent.payment_method"]
    });

    const transactions = await Promise.all(sessions.data.map(async (session) => {
      const user = await User.findById(session.metadata?.userId);
      const purchase = await CoursePurchase.findOne({ 
        paymentId: session.id 
      }).populate('courseId');
      
      const paymentMethod = session.payment_intent?.payment_method;
      
      // Format payment method details
      const paymentMethodDisplay = paymentMethod?.card 
        ? `${paymentMethod.card.brand} ****${paymentMethod.card.last4}`
        : 'Unknown method';

      return {
        id: session.id,
        amount: (session.amount_total || 0) / 100,
        currency: (session.currency || 'usd').toUpperCase(),
        created: new Date(session.created * 1000),
        userEmail: purchase?.userEmail || session.metadata?.userEmail || 'Unknown',
        userDetails: {
          id: session.metadata?.userId,
          username: user?.username || "Unknown",
          accountCreated: user?.createdAt || null
        },
        courseDetails: {
          id: purchase?.courseId?._id,
          title: purchase?.courseId?.courseTitle || 'Unknown'
        },
        payment_method: paymentMethodDisplay,
        status: session.payment_status,
      };
    }));

    res.status(200).json({ success: true, transactions });

  } catch (error) {
    console.error("Transaction error:", error);
    res.status(500).json({ success: false, message: "Error fetching transactions" });
  }
};

export const getTotalTransactionCount = async (_, res) => {
  try {
    // Get count from Stripe
    const transactions = await stripe.paymentIntents.list({
      limit: 1 // Minimal limit since we only need the count
    });
    
    // Return total count from Stripe
    return res.status(200).json({ 
      success: true,
      count: transactions.data.length,
      totalCount: transactions.has_more ? '100+' : transactions.data.length // Estimated count
    });
  } catch (error) {
    console.error('Transaction count error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching transaction count' 
    });
  }
};
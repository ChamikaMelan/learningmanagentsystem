import { Cart } from "../models/cart.model.js";
import { Course } from "../models/course.model.js";
import Stripe from "stripe";
import { User } from "../models/user.model.js";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Get cart items
export const getCartItems = async (req, res) => {
  try {
    const userId = req.id;

    // Find or create cart
    let cart = await Cart.findOne({ userId }).populate({
      path: "items.courseId",
      select: "courseTitle coursePrice courseThumbnail"
    });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((sum, item) => {
      return sum + (item.courseId?.coursePrice || 0);
    }, 0);

    return res.status(200).json({
      success: true,
      cart: {
        items: cart.items,
        totalPrice
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if course already in cart
    const existingItem = cart.items.find(
      item => item.courseId.toString() === courseId
    );

    if (existingItem) {
      return res.status(400).json({ 
        success: false, 
        message: "Course already in cart" 
      });
    }

    // Add course to cart
    cart.items.push({ courseId });
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Course added to cart",
      cartCount: cart.items.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.params;

    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Remove item
    cart.items = cart.items.filter(
      item => item.courseId.toString() !== courseId
    );
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Course removed from cart",
      cartCount: cart.items.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.id;

    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Clear items
    cart.items = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get cart count
export const getCartCount = async (req, res) => {
  try {
    const userId = req.id;

    // Find cart
    const cart = await Cart.findOne({ userId });
    const count = cart ? cart.items.length : 0;

    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create checkout session for multiple courses
export const createCartCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseIds } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If no specific courseIds provided, use all items from cart
    let cartItems;
    if (!courseIds || courseIds.length === 0) {
      const cart = await Cart.findOne({ userId });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Cart is empty" 
        });
      }
      cartItems = cart.items.map(item => item.courseId);
    } else {
      cartItems = courseIds;
    }

    // Get course details
    const courses = await Course.find({ _id: { $in: cartItems } });
    if (courses.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No valid courses found" 
      });
    }

    // Create line items for Stripe
    const lineItems = courses.map(course => ({
      price_data: {
        currency: "lkr",
        product_data: {
          name: course.courseTitle,
          images: [course.courseThumbnail],
        },
        unit_amount: course.coursePrice * 100, // Amount in cents
      },
      quantity: 1,
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `http://localhost:5173/cart`,
      cancel_url: `http://localhost:5173/cart`,
      metadata: {
        userId: userId,
        userEmail: user.email,
        courseIds: JSON.stringify(courses.map(course => course._id))
      },
    });

    if (!session.url) {
      return res.status(400).json({ 
        success: false, 
        message: "Error creating checkout session" 
      });
    }

    return res.status(200).json({
      success: true,
      url: session.url
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
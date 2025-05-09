import React from "react";
import { useGetCartItemsQuery, useRemoveFromCartMutation, useClearCartMutation, useCreateCartCheckoutSessionMutation } from "@/features/api/cartApi";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash, X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const CartPage = () => {
  const { data, isLoading, error } = useGetCartItemsQuery();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [clearCart] = useClearCartMutation();
  const [createCheckout, { isLoading: isCheckoutLoading }] = useCreateCartCheckoutSessionMutation();
  const navigate = useNavigate();

  const handleRemoveItem = async (courseId) => {
    try {
      await removeFromCart(courseId).unwrap();
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart().unwrap();
      toast.success("Cart cleared");
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await createCheckout().unwrap();
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      toast.error("Failed to create checkout session");
    }
  };

  if (isLoading) return <div className="flex justify-center mt-8">Loading your cart...</div>;
  if (error) return <div className="text-center text-red-500 mt-8">Error loading cart</div>;

  const cartItems = data?.cart?.items || [];
  const totalPrice = data?.cart?.totalPrice || 0;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 mt-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <ShoppingCart size={64} className="text-gray-400" />
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-gray-500">Looks like you haven't added any courses yet.</p>
          <Button onClick={() => navigate("/")}>Browse Courses</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Cart ({cartItems.length} items)</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClearCart}
          className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash size={16} className="mr-2" /> Clear Cart
        </Button>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {cartItems.map((item) => (
          <div 
            key={item.courseId._id} 
            className="flex justify-between items-center border rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <img 
                src={item.courseId.courseThumbnail || "/placeholder-course.png"} 
                alt={item.courseId.courseTitle}
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold">{item.courseId.courseTitle}</h3>
                <p className="text-lg font-medium">
                  LKR {item.courseId.coursePrice.toFixed(2)}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleRemoveItem(item.courseId._id)}
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <X size={20} />
            </Button>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium">Total:</span>
          <span className="text-2xl font-bold">LKR {totalPrice.toFixed(2)}</span>
        </div>
        <Button 
          onClick={handleCheckout} 
          disabled={isCheckoutLoading} 
          className="w-full py-6"
        >
          {isCheckoutLoading ? "Processing..." : "Checkout"} <ArrowRight className="ml-2" size={16} />
        </Button>
      </div>
    </div>
  );
};

export default CartPage;
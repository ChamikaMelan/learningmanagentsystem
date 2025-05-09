import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useClearCartMutation } from "@/features/api/cartApi";

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [clearCart] = useClearCartMutation();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the cart after successful checkout
    if (sessionId) {
      clearCart();
    } else {
      // Redirect if no session ID is present
      navigate("/");
    }
  }, [sessionId, clearCart, navigate]);

  return (
    <div className="max-w-lg mx-auto mt-16 p-8 text-center border rounded-lg shadow-sm">
      <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-gray-600 mb-6">
        Thank you for your purchase. Your courses are now available in your dashboard.
      </p>
      <div className="flex flex-col gap-4">
        <Button asChild>
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/courses">Browse More Courses</Link>
        </Button>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
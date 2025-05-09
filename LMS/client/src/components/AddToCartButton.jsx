import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useAddToCartMutation } from "@/features/api/cartApi";

const AddToCartButton = ({ courseId, variant = "default", className = "" }) => {
  const [addToCart, { isLoading }] = useAddToCartMutation();
  
  const handleAddToCart = async () => {
    try {
      await addToCart(courseId).unwrap();
      alert("Course added to cart");
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert(error?.data?.message || "Failed to add course to cart");
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleAddToCart}
      disabled={isLoading}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      Add to Cart
    </Button>
  );
};

export default AddToCartButton;
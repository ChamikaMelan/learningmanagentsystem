import React from "react";
import { cn } from "@/lib/utils"; // Make sure this utility exists in your project

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full p-3 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };

import { memo } from "react";

// Reusable loading spinner component with multiple size options
// Uses React.memo for performance optimization since props rarely change
const Loader = memo(
  ({ size = "md", text = "Loading...", className = "", showText = true }) => {
    // Size mapping for consistent spinner dimensions
    // Each size corresponds to specific height/width classes
    const sizeClasses = {
      sm: "h-6 w-6",
      md: "h-8 w-8",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
      "2xl": "h-24 w-24",
      "3xl": "h-32 w-32",
    };

    return (
      <div
        className={`flex flex-col items-center justify-center gap-4 ${className} animate-[fadeIn_0.6s_ease-in-out]`}
      >
        <div className="relative">
          {/* Static outer ring - provides the spinner background */}
          <div
            className={`${sizeClasses[size]} rounded-full border-4 border-gray-200`}
          ></div>
          {/* Animated inner ring - creates the spinning effect */}
          <div
            className={`${sizeClasses[size]} absolute top-0 left-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin`}
          ></div>
        </div>

        {/* Optional loading text with pulse animation */}
        {showText && text && (
          <p className="text-sm text-gray-600 font-medium animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }
);

export default Loader;

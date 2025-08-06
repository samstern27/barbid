import React from "react";

const Loader = ({
  size = "md",
  text = "Loading...",
  className = "",
  showText = true,
}) => {
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
        {/* Outer ring */}
        <div
          className={`${sizeClasses[size]} rounded-full border-4 border-gray-200`}
        ></div>
        {/* Spinning inner ring */}
        <div
          className={`${sizeClasses[size]} absolute top-0 left-0 rounded-full border-4 border-transparent border-t-red-400 animate-spin`}
        ></div>
      </div>

      {showText && text && (
        <p className="text-sm text-gray-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;

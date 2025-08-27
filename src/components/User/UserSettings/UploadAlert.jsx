import {
  CheckCircleIcon,
  XMarkIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";

// UploadAlert component for displaying user feedback messages
// Features auto-dismiss after 10 seconds, color-coded styling, and accessibility support
export default function UploadAlert({ message, color, onClose }) {
  // State to control alert visibility with auto-dismiss functionality
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss timer - hides alert after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Early return if alert is not visible
  if (!isVisible) return null;

  // Color system configuration for different alert types
  // Each color provides consistent styling for background, text, icon, and button states
  const getColorClasses = (color) => {
    switch (color) {
      case "green":
        return {
          bg: "bg-green-50",
          text: "text-green-800",
          icon: "text-green-400",
          button: "bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50"
        };
      case "red":
        return {
          bg: "bg-red-50",
          text: "text-red-800",
          icon: "text-red-400",
          button: "bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50"
        };
      case "blue":
        return {
          bg: "bg-blue-50",
          text: "text-blue-800",
          icon: "text-blue-400",
          button: "bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600 focus:ring-offset-blue-50"
        };
      case "yellow":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-800",
          icon: "text-yellow-400",
          button: "bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600 focus:ring-offset-yellow-50"
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-800",
          icon: "text-gray-400",
          button: "bg-gray-50 text-gray-500 hover:bg-gray-100 focus:ring-gray-600 focus:ring-offset-gray-50"
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className={`rounded-md ${colorClasses.bg} p-4`}>
      <div className="flex">
        {/* Icon section - shows check circle for green, exclamation for others */}
        <div className="shrink-0">
          {color === "green" ? (
            <CheckCircleIcon
              aria-hidden="true"
              className={`size-5 ${colorClasses.icon}`}
            />
          ) : (
            <ExclamationCircleIcon
              aria-hidden="true"
              className={`size-5 ${colorClasses.icon}`}
            />
          )}
        </div>
        
        {/* Message text with color-coded styling */}
        <div className="ml-3">
          <p className={`text-sm font-medium ${colorClasses.text}`}>{message}</p>
        </div>
        
        {/* Close button with accessibility features */}
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              className={`inline-flex rounded-md p-1.5 focus:ring-2 focus:ring-offset-2 focus:outline-hidden ${colorClasses.button}`}
              onClick={onClose}
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

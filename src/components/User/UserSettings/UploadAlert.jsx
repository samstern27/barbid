import {
  CheckCircleIcon,
  XMarkIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";

export default function UploadAlert({ message, color, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`rounded-md bg-${color}-50 p-4`}>
      <div className="flex">
        <div className="shrink-0">
          {color === "green" ? (
            <CheckCircleIcon
              aria-hidden="true"
              className={`size-5 text-${color}-400`}
            />
          ) : (
            <ExclamationCircleIcon
              aria-hidden="true"
              className={`size-5 text-${color}-400`}
            />
          )}
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium text-${color}-800`}>{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              className={`inline-flex rounded-md bg-${color}-50 p-1.5 text-${color}-500 hover:bg-${color}-100 focus:ring-2 focus:ring-${color}-600 focus:ring-offset-2 focus:ring-offset-${color}-50 focus:outline-hidden`}
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

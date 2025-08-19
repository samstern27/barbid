import React from "react";
import {
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const JobStatusIndicator = ({ job, showAutoCloseWarning = true }) => {
  // Calculate time until shift starts
  const getTimeUntilShift = () => {
    if (!job?.startOfShift) return null;

    const now = new Date();
    const shiftStart = new Date(job.startOfShift);
    const timeDiff = shiftStart.getTime() - now.getTime();

    if (timeDiff <= 0) return null; // Shift has already started

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes, totalMinutes: Math.floor(timeDiff / (1000 * 60)) };
  };

  // Check if job should show auto-close warning
  const shouldShowWarning = () => {
    if (!showAutoCloseWarning || job?.status !== "Open") return false;

    const timeUntilShift = getTimeUntilShift();
    if (!timeUntilShift) return false;

    // Show warning if shift starts in less than 1 hour
    return timeUntilShift.totalMinutes <= 60;
  };

  // Get status styling
  const getStatusStyling = () => {
    switch (job?.status) {
      case "Open":
        return "bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset";
      case "Closed":
        return "bg-red-50 text-red-700 ring-1 ring-red-600/20 ring-inset";
      case "Filled":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 ring-inset";
      case "Accepted":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 ring-inset";
      default:
        return "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20 ring-inset";
    }
  };

  // Get warning styling based on urgency
  const getWarningStyling = () => {
    const timeUntilShift = getTimeUntilShift();
    if (!timeUntilShift) return "";

    if (timeUntilShift.totalMinutes <= 30) {
      return "bg-red-50 text-red-700 ring-1 ring-red-600/20 ring-inset";
    } else if (timeUntilShift.totalMinutes <= 60) {
      return "bg-yellow-50 text-yellow-700 ring-1 ring-red-600/20 ring-inset";
    }
    return "";
  };

  const timeUntilShift = getTimeUntilShift();
  const showWarning = shouldShowWarning();

  return (
    <div className="flex flex-col gap-2">
      {/* Main Status Badge */}
      <span
        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusStyling()}`}
      >
        {job?.status || "Unknown"}
      </span>

      {/* Auto-Close Warning */}
      {showWarning && (
        <div className="flex items-center gap-1">
          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getWarningStyling()}`}
          >
            {timeUntilShift.totalMinutes <= 30
              ? "Closes soon!"
              : "Closes in ~1 hour"}
          </span>
        </div>
      )}

      {/* Time Until Shift (for Open jobs) */}
      {job?.status === "Open" && timeUntilShift && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <ClockIcon className="w-3 h-3" />
          <span>
            {timeUntilShift.hours > 0
              ? `${timeUntilShift.hours}h ${timeUntilShift.minutes}m`
              : `${timeUntilShift.minutes}m`}{" "}
            until shift
          </span>
        </div>
      )}

      {/* Auto-closed indicator */}
      {job?.autoClosedAt && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <ClockIcon className="w-3 h-3" />
          <span>
            Auto-closed:{" "}
            {new Date(job.autoClosedAt).toLocaleString("en-GB", {
              timeZone: "Europe/London",
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default JobStatusIndicator;

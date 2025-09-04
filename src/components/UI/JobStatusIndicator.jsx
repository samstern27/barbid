import React, { memo, useMemo } from "react";
import {
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Job status indicator component that shows current status and time-based warnings
// Handles multiple job statuses and provides visual feedback for urgent situations
const JobStatusIndicator = memo(({ job, showAutoCloseWarning = true }) => {
  // Calculate time remaining until shift starts
  // Returns null if shift has already started or no start time
  const getTimeUntilShift = useMemo(() => {
    if (!job?.startOfShift) return null;

    const now = new Date();
    const shiftStart = new Date(job.startOfShift);
    const timeDiff = shiftStart.getTime() - now.getTime();

    if (timeDiff <= 0) return null; // Shift has already started

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes, totalMinutes: Math.floor(timeDiff / (1000 * 60)) };
  }, [job?.startOfShift]);

  // Determine if auto-close warning should be displayed
  // Shows warning for open jobs that start within 1 hour
  const shouldShowWarning = useMemo(() => {
    if (!showAutoCloseWarning || job?.status !== "Open") return false;

    const timeUntilShift = getTimeUntilShift;
    if (!timeUntilShift) return false;

    // Show warning if shift starts in less than 1 hour
    return timeUntilShift.totalMinutes <= 60;
  }, [showAutoCloseWarning, job?.status, getTimeUntilShift]);

  // Get appropriate styling based on job status
  // Each status has its own color scheme and ring styling
  const getStatusStyling = useMemo(() => {
    switch (job?.status) {
      case "Open":
        return "bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset";
      case "Closed":
        return "bg-red-50 text-red-700 ring-1 ring-red-600/20 ring-inset";
      case "Filled":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 ring-inset";
      case "Accepted":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 ring-inset";
      case "Unattended":
        return "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20 ring-inset";
      default:
        return "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20 ring-inset";
    }
  }, [job?.status]);

  // Get warning styling based on urgency level
  // Red for critical (≤30 min), yellow for warning (≤60 min)
  const getWarningStyling = useMemo(() => {
    const timeUntilShift = getTimeUntilShift;
    if (!timeUntilShift) return "";

    if (timeUntilShift.totalMinutes <= 30) {
      return "bg-red-50 text-red-700 ring-1 ring-red-600/20 ring-inset";
    } else if (timeUntilShift.totalMinutes <= 60) {
      return "bg-yellow-50 text-yellow-700 ring-1 ring-red-600/20 ring-inset";
    }
    return "";
  }, [getTimeUntilShift]);

  const timeUntilShift = getTimeUntilShift;
  const showWarning = shouldShowWarning;

  return (
    <div className="flex flex-col gap-2">
      {/* Primary status badge with color-coded styling */}
      <span
        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusStyling}`}
      >
        {job?.status || "Unknown"}
      </span>

      {/* Auto-close warning with urgency indicator */}
      {showWarning && (
        <div className="flex items-center gap-1">
          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getWarningStyling}`}
          >
            {timeUntilShift.totalMinutes <= 30
              ? "Closes soon!"
              : "Closes in ~1 hour"}
          </span>
        </div>
      )}

      {/* Time remaining display for open jobs */}
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

      {/* Auto-closed timestamp display */}
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
});

export default JobStatusIndicator;

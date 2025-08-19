"use client";

import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  increment,
} from "firebase/database";
import { useAuth } from "../../../contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";

export default function ApplyJob({ applyOpen, setApplyOpen, job }) {
  const { currentUser } = useAuth();

  const [startOfShift, setStartOfShift] = useState("");
  const [endOfShift, setEndOfShift] = useState("");
  const [message, setMessage] = useState("");
  const [payRate, setPayRate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [useOriginalTimes, setUseOriginalTimes] = useState(true);
  const [useOriginalPay, setUseOriginalPay] = useState(true);

  // Calculate min/max times based on original job times
  const originalStart = job?.startOfShift ? new Date(job.startOfShift) : null;
  const originalEnd = job?.endOfShift ? new Date(job.endOfShift) : null;

  // Start time: can only be later than original (up to 1 hour after)
  const minStartTime = originalStart ? originalStart : null; // Can't start earlier than original
  const maxStartTime = originalStart
    ? new Date(originalStart.getTime() + 60 * 60 * 1000)
    : null; // Up to 1 hour after original

  // End time: can only be earlier than original (up to 1 hour before)
  const minEndTime = originalEnd
    ? new Date(originalEnd.getTime() - 60 * 60 * 1000)
    : null; // Up to 1 hour before original
  const maxEndTime = originalEnd ? originalEnd : null; // Can't end later than original

  // Helper function to format date for datetime-local input
  const formatDateForInput = (date) => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Calculate min/max pay rate constraints
  const originalPayRate = parseFloat(job?.payRate) || 0;
  const minPayRate = 12.21; // Legal minimum
  const maxPayRate = originalPayRate * 1.5; // 50% above original

  // Find user details
  const findUserDetails = async () => {
    const db = getDatabase();
    const userId = currentUser.uid;

    // Fetch user profile
    const userRef = ref(db, "users/" + userId + "/profile");
    const userSnapshot = await get(userRef);
    const userProfile = userSnapshot.val() || {};

    return {
      ...userProfile,
    };
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError("");

    try {
      // Find user details
      const userDetails = await findUserDetails();

      const db = getDatabase();
      const userId = currentUser.uid;

      // Determine the actual values to send (original or custom)
      const actualStartTime = useOriginalTimes
        ? job?.startOfShift
        : startOfShift;
      const actualEndTime = useOriginalTimes ? job?.endOfShift : endOfShift;
      const actualPayRate = useOriginalPay ? job?.payRate : payRate;

      // Generate a single application ID for this application
      const applicationId = uuidv4();

      const applyJobRef = ref(
        db,
        "public/jobs/" + job.id + "/jobApplications/" + userId
      );

      // Also save to user's applied jobs list
      const userAppliedJobRef = ref(
        db,
        "users/" + userId + "/jobs/applied/" + applicationId
      );

      // Save application data to both locations
      await Promise.all([
        set(applyJobRef, {
          applicationId: applicationId,
          jobId: job.id,
          businessId: job.businessId,
          businessName: job.businessName,
          userId: userId,
          username: userDetails.username,
          firstName: userDetails.firstName || userDetails.username,
          lastName: userDetails.lastName || "",
          avatar: userDetails.avatar || null,
          occupation: userDetails.occupation || null,
          jobTitle: job.jobTitle,
          startOfShift: actualStartTime,
          endOfShift: actualEndTime,
          payRate: actualPayRate,
          message: message,
          appliedAt: new Date().toISOString(),
          // Store flags to indicate if original values were used
          usedOriginalTimes: useOriginalTimes,
          usedOriginalPay: useOriginalPay,
          // Store original job values for comparison
          originalJobStartTime: job?.startOfShift,
          originalJobEndTime: job?.endOfShift,
          originalJobPayRate: job?.payRate,
        }),
        set(userAppliedJobRef, {
          applicationId: applicationId,
          jobId: job.id,
          businessId: job.businessId,
          businessName: job.businessName,
          userId: userId,
          username: userDetails.username,
          firstName: userDetails.firstName || userDetails.username,
          lastName: userDetails.lastName || "",
          avatar: userDetails.avatar || null,
          occupation: userDetails.occupation || null,
          jobTitle: job.jobTitle,
          startOfShift: actualStartTime,
          endOfShift: actualEndTime,
          payRate: actualPayRate,
          message: message,
          appliedAt: new Date().toISOString(),
          // Store flags to indicate if original values were used
          usedOriginalTimes: useOriginalTimes,
          usedOriginalPay: useOriginalPay,
          // Store original job values for comparison
          originalJobStartTime: job?.startOfShift,
          originalJobEndTime: job?.endOfShift,
          originalJobPayRate: job?.payRate,
        }),
        // Increment the applicant count for this job
        update(ref(db, `public/jobs/${job.id}`), {
          applicantCount: increment(1),
        }),
      ]);

      // Close the form after successful submission
      setApplyOpen(false);

      // Reset form state
      setStartOfShift("");
      setEndOfShift("");
      setMessage("");
      setPayRate("");
      setUseOriginalTimes(true);
      setUseOriginalPay(true);
    } catch (error) {
      console.error("Error applying for job:", error);
      setError("Failed to apply for job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Dialog open={applyOpen} onClose={setApplyOpen} className="relative z-10">
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16"
              style={{ top: "64px" }}
            >
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-2xl transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
              >
                <form
                  className="flex h-full flex-col overflow-y-auto bg-white shadow-xl"
                  onSubmit={handleSubmit}
                >
                  <div className="flex-1">
                    {/* Header */}
                    <div className="bg-gray-50 px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between space-x-3">
                        <div className="space-y-1">
                          <DialogTitle className="text-base font-semibold text-gray-900">
                            Apply for Job
                          </DialogTitle>
                          <p className="text-sm text-gray-500">
                            Choose your preferred shift times and send a message
                            to the employer.
                          </p>
                        </div>
                        <div className="flex h-7 items-center">
                          <button
                            type="button"
                            onClick={() => setApplyOpen(false)}
                            className="relative text-gray-400 hover:text-gray-500"
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon aria-hidden="true" className="size-6" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Error display */}
                    {error && (
                      <div className="px-4 py-3 sm:px-6">
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="text-sm text-red-700">{error}</div>
                        </div>
                      </div>
                    )}

                    {/* Divider container */}
                    <div className="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
                      {/* Time Preference Toggle */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div className="flex items-center h-full">
                          <label className="block text-sm/6 font-medium text-gray-900 sm:mt-1.5">
                            Happy with original times?
                          </label>
                        </div>
                        <div className="sm:col-span-2 flex items-center mt-2 sm:mt-0">
                          <div className="flex items-center gap-3">
                            <div className="group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2 dark:bg-white/5 dark:inset-ring-white/10 dark:outline-indigo-500 dark:has-checked:bg-indigo-500">
                              <span
                                className={`size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out ${
                                  useOriginalTimes ? "translate-x-5" : ""
                                }`}
                              />
                              <input
                                name="useOriginalTimes"
                                type="checkbox"
                                checked={useOriginalTimes}
                                onChange={(e) =>
                                  setUseOriginalTimes(e.target.checked)
                                }
                                aria-label="Use original times"
                                className="absolute inset-0 appearance-none focus:outline-hidden"
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {useOriginalTimes
                                ? "Yes, use original times"
                                : "No, propose different times"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pay Rate Preference Toggle */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div className="flex items-center h-full">
                          <label className="block text-sm/6 font-medium text-gray-900 sm:mt-1.5">
                            Happy with original pay rate?
                          </label>
                        </div>
                        <div className="sm:col-span-2 flex items-center mt-2 sm:mt-0">
                          <div className="flex items-center gap-3">
                            <div className="group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2 dark:bg-white/5 dark:inset-ring-white/10 dark:outline-indigo-500 dark:has-checked:bg-indigo-500">
                              <span
                                className={`size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out ${
                                  useOriginalPay ? "translate-x-5" : ""
                                }`}
                              />
                              <input
                                name="useOriginalPay"
                                type="checkbox"
                                checked={useOriginalPay}
                                onChange={(e) =>
                                  setUseOriginalPay(e.target.checked)
                                }
                                aria-label="Use original pay rate"
                                className="absolute inset-0 appearance-none focus:outline-hidden"
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {useOriginalPay
                                ? "Yes, use original pay rate"
                                : "No, propose different pay rate"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Start of Shift */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div className="flex items-center h-full">
                          <label
                            htmlFor="start-of-shift"
                            className="block text-sm/6 font-medium text-gray-900 sm:mt-1.5"
                          >
                            Preferred Start Time
                          </label>
                        </div>
                        <div className="sm:col-span-2 flex items-center mt-2 sm:mt-0">
                          <div className="relative w-full">
                            <input
                              id="start-of-shift"
                              name="start-of-shift"
                              type="datetime-local"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                              value={
                                useOriginalTimes
                                  ? job?.startOfShift
                                  : startOfShift
                              }
                              onChange={(e) => setStartOfShift(e.target.value)}
                              min={formatDateForInput(minStartTime)}
                              max={formatDateForInput(maxStartTime)}
                              disabled={useOriginalTimes}
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Original time: {originalStart?.toLocaleString()}
                            </p>
                            {!useOriginalTimes && (
                              <>
                                <p className="text-xs text-gray-500 mt-1">
                                  Can start up to 1 hour after original time
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Min: {minStartTime?.toLocaleString()} | Max:{" "}
                                  {maxStartTime?.toLocaleString()}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* End of Shift */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div className="flex items-center h-full">
                          <label
                            htmlFor="end-of-shift"
                            className="block text-sm/6 font-medium text-gray-900 sm:mt-1.5"
                          >
                            Preferred End Time
                          </label>
                        </div>
                        <div className="sm:col-span-2 flex items-center mt-2 sm:mt-0">
                          <div className="relative w-full">
                            <input
                              id="end-of-shift"
                              name="end-of-shift"
                              type="datetime-local"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                              value={
                                useOriginalTimes ? job?.endOfShift : endOfShift
                              }
                              onChange={(e) => setEndOfShift(e.target.value)}
                              min={formatDateForInput(minEndTime)}
                              max={formatDateForInput(maxEndTime)}
                              disabled={useOriginalTimes}
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Original time: {originalEnd?.toLocaleString()}
                            </p>
                            {!useOriginalTimes && (
                              <>
                                <p className="text-xs text-gray-500 mt-1">
                                  Can end up to 1 hour before original time
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Min: {minEndTime?.toLocaleString()} | Max:{" "}
                                  {maxEndTime?.toLocaleString()}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pay Rate */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div className="flex flex-col h-full">
                          <label
                            htmlFor="pay-rate"
                            className="block text-sm/6 font-medium text-gray-900 sm:mt-1.5"
                          >
                            Pay Rate (£/hr)
                          </label>
                        </div>
                        <div className="sm:col-span-2 flex items-center mt-2 sm:mt-0">
                          <div className="relative w-full">
                            <input
                              id="pay-rate"
                              name="pay-rate"
                              type="number"
                              min={minPayRate}
                              max={maxPayRate}
                              step="0.01"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                              value={useOriginalPay ? job?.payRate : payRate}
                              onChange={(e) => setPayRate(e.target.value)}
                              placeholder="e.g., 12.50"
                              disabled={useOriginalPay}
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Original pay rate: £{job?.payRate || "N/A"}/hr
                            </p>
                            {!useOriginalPay && (
                              <p className="text-xs text-gray-500 mt-1">
                                Bidding range: £{minPayRate.toFixed(2)} - £
                                {maxPayRate.toFixed(2)}/hr
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <label
                            htmlFor="message"
                            className="block text-sm/6 font-medium text-gray-900 sm:mt-1.5"
                          >
                            Message to Employer
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <textarea
                            id="message"
                            name="message"
                            rows={4}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell the employer why you're interested in this job, your relevant experience, and why you'd be a great fit..."
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setApplyOpen(false)}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Applying..." : "Apply"}
                      </button>
                    </div>
                  </div>
                </form>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

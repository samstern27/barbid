"use client";

import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  LinkIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/20/solid";
import { getDatabase, ref, set, update, get } from "firebase/database";
import { useAuth } from "../../../contexts/AuthContext";
import { useBusiness } from "../../../contexts/BusinessContext";
import { v4 as uuidv4 } from "uuid";

export default function CreateJob({ createJobOpen, setCreateJobOpen }) {
  const { currentUser } = useAuth();
  const { selectedBusiness } = useBusiness();

  const [jobTitle, setJobTitle] = useState("");
  const [startOfShift, setStartOfShift] = useState("");
  const [endOfShift, setEndOfShift] = useState("");
  const [payRate, setPayRate] = useState("");
  const [description, setDescription] = useState("");
  const [jobId, setJobId] = useState(uuidv4());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!jobTitle) {
      setError("Job title is required");
      return;
    }

    if (!startOfShift) {
      setError("Start of shift is required");
      return;
    }

    if (!endOfShift) {
      setError("End of shift is required");
      return;
    }

    // Check if end time is before start time
    if (new Date(endOfShift) <= new Date(startOfShift)) {
      setError("End of shift must be after start of shift");
      return;
    }

    // Check if start time is at least 1 hour from now
    const now = new Date();
    const startTime = new Date(startOfShift);
    const oneHourFromNow = new Date(now.getTime() + 1 * 60 * 60 * 1000);

    if (startTime <= oneHourFromNow) {
      setError(
        "Start of shift must be at least 1 hour from now to allow time for applications"
      );
      return;
    }

    if (!payRate) {
      setError("Pay rate is required");
      return;
    }

    // Check if pay rate is below minimum wage
    if (parseFloat(payRate) < 12.21) {
      setError("Pay rate must be at least £12.21 per hour (UK minimum wage)");
      return;
    }

    if (!currentUser?.uid) {
      setError("You must be logged in to create a job");
      return;
    }

    if (!selectedBusiness) {
      setError("Please select a business first");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const db = getDatabase();
      const userId = currentUser.uid;

      // Create job data object once
      const jobData = {
        jobTitle: jobTitle,
        startOfShift: startOfShift,
        endOfShift: endOfShift,
        payRate: payRate,
        description: description,
        status: "Open",
        applicantCount: 0,
        location: {
          address: selectedBusiness.address,
          postcode: selectedBusiness.postcode,
          city: selectedBusiness.city,
          lat: selectedBusiness.coords.lat,
          lng: selectedBusiness.coords.lng,
        },
        jobId: jobId,
        businessId: selectedBusiness.id,
        businessName: selectedBusiness.name,
        businessOwnerId: userId,
        businessPrivacy: selectedBusiness.privacy, // Include business privacy in job data
        createdAt: new Date().toISOString(),
      };

      const userJobRef = ref(
        db,
        "users/" +
          userId +
          "/business/" +
          selectedBusiness.id +
          "/jobs/" +
          jobId
      );

      // Only post to public jobs if the business is public
      console.log("Business privacy setting:", selectedBusiness.privacy);
      console.log("Business ID:", selectedBusiness.id);
      console.log(
        "Will post to public jobs:",
        selectedBusiness.privacy === "public"
      );

      if (selectedBusiness.privacy === "public") {
        const publicJobRef = ref(db, "public/jobs/" + jobId);
        console.log("Posting job to public jobs:", jobId);
        // Set the same data to both paths
        await Promise.all([
          set(userJobRef, jobData),
          set(publicJobRef, jobData),
        ]);
      } else {
        console.log("Business is private, not posting to public jobs");
        // Only set to user's private business if business is private
        await set(userJobRef, jobData);
      }

      // Count existing jobs and update jobListings
      const jobsRef = ref(
        db,
        "users/" + userId + "/business/" + selectedBusiness.id + "/jobs"
      );
      const jobsSnapshot = await get(jobsRef);
      const jobsCount = jobsSnapshot.exists()
        ? Object.keys(jobsSnapshot.val()).length
        : 0;

      const businessRef = ref(
        db,
        "users/" + userId + "/business/" + selectedBusiness.id
      );
      await update(businessRef, {
        jobListings: jobsCount,
      });

      // Also update the public business reference if it exists
      const publicBusinessRef = ref(
        db,
        `public/businesses/${selectedBusiness.id}`
      );
      try {
        await update(publicBusinessRef, {
          jobListings: jobsCount,
        });
      } catch (error) {
        // Public business might not exist yet, that's okay
        console.log("Public business reference not found, skipping update");
      }

      setCreateJobOpen(false);

      // Reset form
      setJobTitle("");
      setStartOfShift("");
      setEndOfShift("");
      setPayRate("");
      setDescription("");
      setJobId(uuidv4());
    } catch (error) {
      console.error("Error creating job:", error);
      setError("Failed to create job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Dialog
        open={createJobOpen}
        onClose={setCreateJobOpen}
        className="relative z-10"
      >
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
                            New Job Listing
                          </DialogTitle>
                          <p className="text-sm text-gray-500">
                            Get started by filling in the information below to
                            create your new job listing.
                          </p>
                        </div>
                        <div className="flex h-7 items-center">
                          <button
                            type="button"
                            onClick={() => setCreateJobOpen(false)}
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
                      {/* Job title */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div className="flex items-center h-full">
                          <label
                            htmlFor="job-title"
                            className="block text-sm/6 font-medium text-gray-900"
                          >
                            Job title
                          </label>
                        </div>
                        <div className="sm:col-span-2 flex items-center mt-2 sm:mt-0">
                          <div className="relative w-full">
                            <select
                              id="job-title"
                              name="job-title"
                              className="block w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                              defaultValue={jobTitle || ""}
                              onChange={(e) => setJobTitle(e.target.value)}
                            >
                              <option value="" disabled>
                                Select a job title
                              </option>
                              <option value="Barista">Barista</option>
                              <option value="Bar Back">Bar Back</option>
                              <option value="Bar Manager">Bar Manager</option>
                              <option value="Bar Supervisor">
                                Bar Supervisor
                              </option>
                              <option value="Bartender">Bartender</option>
                              <option value="Busser">Busser</option>
                              <option value="Cafe Host">Cafe Host</option>
                              <option value="Cafe Manager">Cafe Manager</option>
                              <option value="Cafe Server">Cafe Server</option>
                              <option value="Cafe Supervisor">
                                Cafe Supervisor
                              </option>
                              <option value="Club Host">Club Host</option>
                              <option value="Club Manager">Club Manager</option>
                              <option value="Club Server">Club Server</option>
                              <option value="Club Supervisor">
                                Club Supervisor
                              </option>
                              <option value="Floor Manager">
                                Floor Manager
                              </option>
                              <option value="Food Runner">Food Runner</option>
                              <option value="Host/Hostess">Host/Hostess</option>
                              <option value="Restaurant Host">
                                Restaurant Host
                              </option>
                              <option value="Restaurant Manager">
                                Restaurant Manager
                              </option>
                              <option value="Restaurant Supervisor">
                                Restaurant Supervisor
                              </option>
                              <option value="Server">Server</option>
                              <option value="VIP Host">VIP Host</option>
                              <option value="VIP Manager">VIP Manager</option>
                              <option value="VIP Server">VIP Server</option>
                              <option value="Waiter/Waitress">
                                Waiter/Waitress
                              </option>
                              <option value="Other">Other</option>
                            </select>
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-5 text-gray-500 sm:size-4"
                            />
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
                            Start of Shift
                          </label>
                        </div>
                        <div className="sm:col-span-2 flex items-center mt-2 sm:mt-0">
                          <div className="relative w-full">
                            <input
                              id="start-of-shift"
                              name="start-of-shift"
                              type="datetime-local"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                              value={startOfShift}
                              onChange={(e) => setStartOfShift(e.target.value)}
                            />
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
                            End of Shift
                          </label>
                        </div>
                        <div className="sm:col-span-2 flex items-center mt-2 sm:mt-0">
                          <div className="relative w-full">
                            <input
                              id="end-of-shift"
                              name="end-of-shift"
                              type="datetime-local"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                              value={endOfShift}
                              onChange={(e) => setEndOfShift(e.target.value)}
                              min={startOfShift || undefined}
                            />
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
                          <p className="text-xs text-gray-500 mt-1">
                            *Cannot be modified once job is created
                          </p>
                        </div>
                        <div className="sm:col-span-2 flex items-center mt-2 sm:mt-0">
                          <div className="relative w-full">
                            <input
                              id="pay-rate"
                              name="pay-rate"
                              type="number"
                              min="12.21"
                              step="0.01"
                              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                              value={payRate}
                              onChange={(e) => setPayRate(e.target.value)}
                              placeholder="e.g., 12.50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Job Description */}
                      <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                        <div>
                          <label
                            htmlFor="job-description"
                            className="block text-sm/6 font-medium text-gray-900 sm:mt-1.5"
                          >
                            Job Description
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <textarea
                            id="job-description"
                            name="job-description"
                            rows={3}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the job requirements, responsibilities, and any other relevant details..."
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
                        onClick={() => setCreateJobOpen(false)}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Creating..." : "Create Job"}
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

import { useState, useEffect } from "react";

import { useAuth } from "../../../contexts/AuthContext";
import { EyeIcon } from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import Loader from "../../../components/UI/Loader";
import { getDatabase, ref, onValue, get } from "firebase/database";
import JobStatusIndicator from "../../../components/UI/JobStatusIndicator";

// MyJobsActive component for displaying user's active job applications
// Features real-time job status updates, data merging, and active job filtering
export default function MyJobsActive() {
  // Local state for jobs data and loading
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Listen for real-time updates on job applications with real-time job status
  // Merges user application data with current job information for comprehensive display
  useEffect(() => {
    if (!currentUser?.uid) return;

    const db = getDatabase();

    // Listen for real-time updates on user's applications
    const userApplicationsRef = ref(
      db,
      `users/${currentUser.uid}/jobs/applied`
    );
    const publicJobsRef = ref(db, `public/jobs`);

    const unsubscribeUser = onValue(
      userApplicationsRef,
      (applicationsSnapshot) => {
        try {
          if (applicationsSnapshot.exists()) {
            const applications = applicationsSnapshot.val();

            // Get job IDs from applications
            const jobIds = Object.values(applications).map((app) => app.jobId);

            // Fetch real-time job data for these specific jobs
            get(publicJobsRef)
              .then((jobsSnapshot) => {
                if (jobsSnapshot.exists()) {
                  const allJobs = jobsSnapshot.val();

                  // Merge application data with real-time job status
                  const mergedJobs = Object.values(applications).map(
                    (application) => {
                      const jobData = allJobs[application.jobId];

                      // If job doesn't exist anymore, mark it as deleted
                      if (!jobData) {
                        return {
                          ...application,
                          id: application.jobId,
                          status: "Deleted",
                          applicantCount: 0,
                          jobTitle: application.jobTitle || "Job Deleted",
                          startOfShift: application.startOfShift,
                          endOfShift: application.endOfShift,
                          payRate: application.payRate,
                          businessName: application.businessName,
                        };
                      }

                      return {
                        ...application,
                        id: application.jobId,
                        // Use application status if it's "Accepted", otherwise use job status
                        status:
                          application.status === "Accepted"
                            ? "Accepted"
                            : jobData.status || "Unknown",
                        applicantCount: jobData.applicantCount || 0,
                        jobTitle: jobData.jobTitle || application.jobTitle,
                        startOfShift:
                          jobData.startOfShift || application.startOfShift,
                        endOfShift:
                          jobData.endOfShift || application.endOfShift,
                        payRate: jobData.payRate || application.payRate,
                        businessName:
                          jobData.businessName || application.businessName,
                      };
                    }
                  );

                  // Filter to only show active jobs (Open status) and exclude deleted jobs
                  const activeJobs = mergedJobs.filter(
                    (job) => job.status === "Open"
                  );

                  // Sort by newest first (by createdAt date, fallback to appliedAt)
                  const sortedActiveJobs = activeJobs.sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.appliedAt || 0);
                    const dateB = new Date(b.createdAt || b.appliedAt || 0);
                    return dateB - dateA; // Newest first
                  });

                  setJobs(sortedActiveJobs);
                } else {
                  // Fallback to application data if public jobs not found
                  const fallbackJobs = Object.values(applications).map(
                    (application) => ({
                      ...application,
                      id: application.jobId,
                      status: "Unknown",
                      applicantCount: 0,
                    })
                  );
                  // Filter to only show active jobs
                  const activeFallbackJobs = fallbackJobs.filter(
                    (job) => job.status === "Open"
                  );

                  // Sort by newest first (by appliedAt date)
                  const sortedActiveFallbackJobs = activeFallbackJobs.sort(
                    (a, b) => {
                      const dateA = new Date(a.appliedAt || 0);
                      const dateB = new Date(b.appliedAt || 0);
                      return dateB - dateA; // Newest first
                    }
                  );

                  setJobs(sortedActiveFallbackJobs);
                }
                setLoading(false);
              })
              .catch((error) => {
                // Fallback to application data
                const fallbackJobs = Object.values(applications).map(
                  (application) => ({
                    ...application,
                    id: application.jobId,
                    status: "Unknown",
                    applicantCount: 0,
                  })
                );
                // Filter to only show active jobs
                const activeFallbackJobs = fallbackJobs.filter(
                  (job) => job.status === "Open"
                );

                // Sort by newest first (by appliedAt date)
                const sortedActiveFallbackJobs = activeFallbackJobs.sort(
                  (a, b) => {
                    const dateA = new Date(a.appliedAt || 0);
                    const dateB = new Date(b.appliedAt || 0);
                    return dateB - dateA; // Newest first
                  }
                );

                setJobs(sortedActiveFallbackJobs);
                setLoading(false);
              });
          } else {
            setJobs([]);
            setLoading(false);
          }
        } catch (error) {
          setJobs([]);
          setLoading(false);
        }
      }
    );

    return () => {
      unsubscribeUser();
    };
  }, [currentUser?.uid]);

  // Jobs data loaded and processed

  return (
    <div className="animate-[fadeIn_0.6s_ease-in-out]">
      {/* Header section with title and description */}
      <div className="sm:flex sm:items-center bg-indigo-50 p-4 rounded-lg">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900">Active Jobs</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage your active jobs.
          </p>
        </div>
      </div>
      
      {/* Job listings table section */}
      <div className="-mx-4 mt-8 sm:-mx-0">
        {loading ? (
          /* Loading state with spinner */
          <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
            <Loader size="2xl" text="Loading job listings..." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              {/* Active jobs table */}
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    {/* Job Title column */}
                    <th
                      scope="col"
                      className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Job Title
                    </th>
                    {/* Date & Time column (hidden on small screens) */}
                    <th
                      scope="col"
                      className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                    >
                      Date & Time of Shift
                    </th>
                    {/* Venue column (hidden on small screens) */}
                    <th
                      scope="col"
                      className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                    >
                      Venue
                    </th>
                    {/* Status column */}
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                    >
                      Pay Rate (£/hr)
                    </th>
                    <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-0">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {jobs && jobs.length > 0 ? (
                    jobs.map((job) => {
                      return (
                        <tr key={job.id}>
                          <td className="py-4 pr-3 pl-4 text-sm font-medium text-gray-900 sm:pl-0">
                            {job.jobTitle}
                          </td>
                          <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                            {job.startOfShift.split("T")[0].replace(/-/g, "/")}{" "}
                            <strong>{job.startOfShift.split("T")[1]}</strong> -{" "}
                            {job.endOfShift.split("T")[0].replace(/-/g, "/")}{" "}
                            <strong>{job.endOfShift.split("T")[1]}</strong>
                          </td>
                          <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 lg:table-cell">
                            {job.businessName}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            <JobStatusIndicator
                              job={job}
                              showAutoCloseWarning={true}
                            />
                          </td>
                          <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                            £{parseFloat(job.payRate).toFixed(2)}
                          </td>
                          <td className="py-4 pr-4 pl-3 text-right text-sm font-medium text-gray-500 sm:pr-0">
                            <NavLink
                              to={`/jobs/application/${job.id}`}
                              className="text-indigo-500 hover:text-indigo-600 flex items-center gap-2"
                            >
                              <EyeIcon className="w-4 h-4" />
                              View
                              <span className="sr-only">
                                , {job.startOfShift}
                              </span>
                            </NavLink>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-3 py-4 text-sm text-gray-500 text-center"
                      >
                        No active jobs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

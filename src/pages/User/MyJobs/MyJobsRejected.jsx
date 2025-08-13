import { useState, useEffect } from "react";

import { useAuth } from "../../../contexts/AuthContext";
import { EyeIcon } from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import Loader from "../../../components/UI/Loader";
import { getDatabase, ref, onValue, get } from "firebase/database";

export default function MyJobsRejected() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Listen for real-time updates on job applications with real-time job status
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
                        status: application.status === "Accepted" ? "Accepted" : (jobData.status || "Unknown"),
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

                  // Filter to only show rejected/ended jobs (Closed or Deleted status)
                  // Exclude "Accepted" applications and "Filled" jobs that are actually accepted
                  const endedJobs = mergedJobs.filter(
                    (job) =>
                      (job.status === "Closed" || job.status === "Deleted") &&
                      job.status !== "Accepted"
                  );

                  setJobs(endedJobs);
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
                  // Filter to only show rejected/ended jobs
                  const endedFallbackJobs = fallbackJobs.filter(
                    (job) =>
                      (job.status === "Closed" || job.status === "Deleted") &&
                      job.status !== "Accepted"
                  );
                  setJobs(endedFallbackJobs);
                }
                setLoading(false);
              })
              .catch((error) => {
                console.error("Error fetching public jobs:", error);
                // Fallback to application data
                const fallbackJobs = Object.values(applications).map(
                  (application) => ({
                    ...application,
                    id: application.jobId,
                    status: "Unknown",
                    applicantCount: 0,
                  })
                );
                // Filter to only show rejected/ended jobs
                const endedFallbackJobs = fallbackJobs.filter(
                  (job) =>
                    (job.status === "Closed" || job.status === "Deleted") &&
                    job.status !== "Accepted"
                );
                setJobs(endedFallbackJobs);
                setLoading(false);
              });
          } else {
            setJobs([]);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error processing user applications:", error);
          setJobs([]);
          setLoading(false);
        }
      }
    );

    return () => {
      unsubscribeUser();
    };
  }, [currentUser?.uid]);

  return (
    <div className="animate-[fadeIn_0.6s_ease-in-out]">
      <div className="sm:flex sm:items-center bg-indigo-50 p-4 rounded-lg">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900">
            Rejected Jobs
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            View your jobs that have been rejected.
          </p>
        </div>
      </div>
      <div className="-mx-4 mt-8 sm:-mx-0">
        {loading ? (
          <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
            <Loader size="2xl" text="Loading job listings..." />
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    Job Title
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                  >
                    Date & Time of Shift
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                  >
                    Venue
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
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
                        <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0">
                          {job.jobTitle}
                        </td>
                        <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 sm:table-cell">
                          {job.startOfShift.split("T")[0].replace(/-/g, "/")}{" "}
                          <strong>{job.startOfShift.split("T")[1]}</strong> -{" "}
                          {job.endOfShift.split("T")[0].replace(/-/g, "/")}{" "}
                          <strong>{job.endOfShift.split("T")[1]}</strong>
                        </td>
                        <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 lg:table-cell">
                          {job.businessName}
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                              job.status === "Filled"
                                ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"
                                : job.status === "Closed"
                                ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                                : "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20"
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 lg:table-cell">
                          £{parseFloat(job.payRate).toFixed(2)}
                        </td>
                        <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
                          <NavLink
                            to={`/my-jobs/${job.id}`}
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
                      No rejected jobs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import { useBusiness } from "../../../contexts/BusinessContext";
import { EyeIcon } from "@heroicons/react/24/outline";
import Loader from "../../../components/UI/Loader";
import { getDatabase, ref, onValue } from "firebase/database";
import JobStatusIndicator from "../../../components/UI/JobStatusIndicator";
import CreateJob from "../../../components/User/MyBusiness/CreateJob";

// MyBusinessJobListings component for managing job listings within a business
// Features real-time job updates, sorting, and job creation functionality
export default function MyBusinessJobListings() {
  // Route parameters and business context
  const { businessId } = useParams();
  const { selectedBusiness } = useBusiness();

  // Local state for jobs, loading, and modal management
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createJobOpen, setCreateJobOpen] = useState(false);

  // Listen for real-time updates on job applications and listings
  // Uses dual Firebase listeners for comprehensive job data coverage
  useEffect(() => {
    if (!businessId) return;

    const db = getDatabase();

    // Listen for real-time updates on jobs for the specific business
    const userBusinessJobsRef = ref(
      db,
      `users/${
        selectedBusiness?.ownerId || selectedBusiness?.id
      }/business/${businessId}/jobs`
    );

    // Also listen to public jobs as backup to catch any jobs created there
    const publicJobsRef = ref(db, `public/jobs`);

    // User business jobs listener
    const unsubscribeUser = onValue(userBusinessJobsRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const userBusinessJobs = snapshot.val();
          const jobs = Object.entries(userBusinessJobs).map(([jobId, job]) => ({
            id: jobId,
            ...job,
            applicantCount: job.applicantCount || 0,
          }));

          // Sort by newest first (by createdAt date)
          const sortedJobs = jobs.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA; // Newest first
          });

          setJobs(sortedJobs);
        } else {
          setJobs([]);
        }
        setLoading(false);
      } catch (error) {
        setJobs([]);
        setLoading(false);
      }
    });

    // Public jobs listener for backup coverage
    const unsubscribePublic = onValue(publicJobsRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const allJobs = snapshot.val();
          const businessJobs = Object.entries(allJobs)
            .filter(([_, job]) => job.businessId === businessId)
            .map(([jobId, job]) => ({
              id: jobId,
              ...job,
              applicantCount: job.applicantCount || 0,
            }));

          // Only update if we don't have jobs from user path or if public has more jobs
          setJobs((prevJobs) => {
            if (
              prevJobs.length === 0 ||
              businessJobs.length > prevJobs.length
            ) {
              // Sort by newest first (by createdAt date)
              const sortedBusinessJobs = businessJobs.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA; // Newest first
              });
              return sortedBusinessJobs;
            }
            return prevJobs;
          });
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeUser();
      unsubscribePublic();
    };
  }, [businessId, selectedBusiness]);

  // Show error state if business is not found
  if (!selectedBusiness) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">Business not found.</div>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.6s_ease-in-out]">
      {/* Header section with title and create job button */}
      <div className="sm:flex sm:items-center bg-indigo-50 p-4 rounded-lg">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900">
            Job Listings
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage your job listings.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setCreateJobOpen(true)}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create Job
          </button>
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
              {/* Job listings table */}
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
                    {/* Applicants column (hidden on small screens) */}
                    <th
                      scope="col"
                      className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                    >
                      Applicants
                    </th>
                    {/* Status column (hidden on small screens) */}
                    <th
                      scope="col"
                      className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                    >
                      Status
                    </th>
                    {/* Pay Rate column */}
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Pay Rate (£/hr)
                    </th>
                    {/* Actions column */}
                    <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-0">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>

                {/* Table body with job data */}
                <tbody className="divide-y divide-gray-200 bg-white">
                  {jobs && jobs.length > 0 ? (
                    /* Render job rows when jobs exist */
                    jobs.map((job) => {
                      return (
                        <tr key={job.id}>
                          {/* Job title cell */}
                          <td className="py-4 pr-3 pl-4 text-sm font-medium text-gray-900 sm:pl-0">
                            {job.jobTitle}
                          </td>
                          {/* Date and time cell with formatted display */}
                          <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                            {job.startOfShift.split("T")[0].replace(/-/g, "/")}{" "}
                            <strong>{job.startOfShift.split("T")[1]}</strong> -{" "}
                            {job.endOfShift.split("T")[0].replace(/-/g, "/")}{" "}
                            <strong>{job.endOfShift.split("T")[1]}</strong>
                          </td>
                          {/* Applicant count cell */}
                          <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                            {job.applicantCount || 0}
                          </td>
                          {/* Job status cell with indicator component */}
                          <td className="px-3 py-4 text-sm text-gray-500">
                            <JobStatusIndicator
                              job={job}
                              showAutoCloseWarning={true}
                            />
                          </td>
                          {/* Pay rate cell with formatted currency */}
                          <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                            £{parseFloat(job.payRate).toFixed(2)}
                          </td>
                          {/* View action cell with navigation link */}
                          <td className="py-4 pr-4 pl-3 text-right text-sm font-medium text-gray-500 sm:pr-0">
                            <NavLink
                              to={`/my-business/${selectedBusiness.id}/job-listings/${job.id}`}
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
                    /* Empty state when no jobs exist */
                    <tr>
                      <td
                        colSpan="6"
                        className="px-3 py-4 text-sm text-gray-500 text-center"
                      >
                        No job listings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* CreateJob Modal for adding new job listings */}
      <CreateJob
        createJobOpen={createJobOpen}
        setCreateJobOpen={setCreateJobOpen}
      />
    </div>
  );
}

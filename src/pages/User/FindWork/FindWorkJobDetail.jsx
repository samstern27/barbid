import { useState, useEffect, useMemo } from "react";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/20/solid";
import { NavLink, useParams } from "react-router-dom";
import Breadcrumb from "../../../components/UI/Breadcrumb";
import { JobProvider, useJob } from "../../../contexts/JobContext";
import { LocationProvider } from "../../../contexts/LocationContext";
import Loader from "../../../components/UI/Loader";
import ApplyJob from "../../../components/User/FindWork/ApplyJob";
import { getDatabase, ref, get } from "firebase/database";
import { useAuth } from "../../../contexts/AuthContext";

// Breadcrumb navigation configuration for job detail page
const pages = [
  { name: "Find Work", href: "/find-work", current: false },
  { name: "Job Details", href: "#", current: true },
];

// Main content component for job detail page
// Displays comprehensive job information and handles application process
function FindWorkJobDetailContent() {
  // Authentication and job data from contexts
  const { currentUser } = useAuth();
  const { publicJobs } = useJob();
  const { jobId } = useParams();

  // Find the specific job by ID from URL parameters
  const job = publicJobs.find((job) => job.id === jobId);
  const [loading, setLoading] = useState(true);

  // Update loading state when job data is available
  useEffect(() => {
    if (job) {
      setLoading(false);
    }
  }, [job]);

  // Check if user has already applied for the job
  const [hasApplied, setHasApplied] = useState(false);
  useEffect(() => {
    if (!job?.id || !currentUser?.uid) return;

    const checkIfApplied = async () => {
      const db = getDatabase();
      const userId = currentUser.uid;
      const userJobRef = ref(
        db,
        "public/jobs/" + job.id + "/jobApplications/" + userId
      );
      const userJobSnapshot = await get(userJobRef);
      setHasApplied(userJobSnapshot.exists());
    };

    checkIfApplied();
  }, [job, currentUser]);

  // Google Maps iframe element for job location
  // Memoized to prevent unnecessary re-renders
  const mapElement = useMemo(() => {
    if (!job?.location) return null;

    return (
      <div className="w-full">
        <iframe
          className="w-full h-64 sm:h-80 md:h-96 lg:h-[450px] rounded-lg"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${
            import.meta.env.VITE_GOOGLE_API_KEY
          }&q=${encodeURIComponent(
            `${job.location.address}, ${job.location.city}, ${job.location.postcode}`
          )}`}
        ></iframe>
      </div>
    );
  }, [job?.location?.address, job?.location?.city, job?.location?.postcode]);

  // Application modal state
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <div className="flex flex-col m-10 gap-4 ">
      {/* Navigation breadcrumb */}
      <Breadcrumb pages={pages} />

      {/* Conditional rendering based on loading state */}
      {loading ? (
        <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
          <Loader
            size="2xl"
            text="Loading job details..."
            className="animate-pulse fadeIn min-h-[60vh]"
          />
        </div>
      ) : (
        <div className="animate-[fadeIn_1.2s_ease-in-out]">
          {/* Back navigation link */}
          <NavLink
            to="/find-work"
            className="inline-flex items-center gap-2 text-sm mb-6 font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Find Work
          </NavLink>

          {/* Job header with title and business name */}
          <div className="">
            <h3 className="text-base/7 font-normal text-gray-900">
              <span className="font-bold">{job?.jobTitle || "Loading..."}</span>{" "}
              at{" "}
              <span className="font-bold text-indigo-600">
                {job?.businessName || "Loading..."}
              </span>
            </h3>
            <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">
              View job details and apply.
            </p>
          </div>

          {/* Action buttons section */}
          <div className="flex flex-col gap-4 mb-6 mt-6 sm:flex-row sm:gap-6 justify-start">
            {/* Show different content based on job ownership */}
            {currentUser && job?.businessOwnerId === currentUser.uid ? (
              /* Owner cannot apply to their own job */
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-center">
                <span className="text-sm font-medium text-blue-900">
                  This is your job listing - you cannot apply
                </span>
              </div>
            ) : (
              /* Apply button with different states */
              <button
                type="button"
                disabled={hasApplied}
                onClick={() => setApplyOpen(!applyOpen)}
                className={
                  hasApplied
                    ? "rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 cursor-not-allowed"
                    : "rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 "
                }
              >
                {hasApplied ? (
                  <>
                    <span className="flex items-center">
                      Applied
                      <CheckIcon className="ml-2 w-4 h-4" />
                    </span>
                  </>
                ) : (
                  "Apply"
                )}
              </button>
            )}
          </div>

          {/* Job details section */}
          <div className="mt-6 border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              {/* Job Title */}
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900">
                  Job Title
                </dt>
                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <span className="grow">{job?.jobTitle || "Loading..."}</span>
                </dd>
              </div>

              {/* Job Description */}
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900">
                  Description
                </dt>
                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <span className="grow">
                    {job?.description || "Loading..."}
                  </span>
                </dd>
              </div>

              {/* Pay Rate */}
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900">
                  Pay Rate
                </dt>
                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <span className="grow">
                    £{job?.payRate || "Loading..."}/hr
                  </span>
                </dd>
              </div>

              {/* Start Time */}
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900">
                  Start Time
                </dt>
                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <span className="grow">
                    {job?.startOfShift
                      ? new Date(job.startOfShift).toLocaleString("en-GB", {
                          timeZone: "Europe/London",
                        })
                      : "Loading..."}
                  </span>
                </dd>
              </div>

              {/* End Time */}
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900">
                  End Time
                </dt>
                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <span className="grow">
                    {job?.endOfShift
                      ? new Date(job.endOfShift).toLocaleString("en-GB", {
                          timeZone: "Europe/London",
                        })
                      : "Loading..."}
                  </span>
                </dd>
              </div>

              {/* Job Status */}
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900">Status</dt>
                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <span className="grow">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        job?.status === "Open"
                          ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                          : "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20"
                      }`}
                    >
                      {job?.status || "Loading..."}
                    </span>
                  </span>
                </dd>
              </div>

              {/* Created Date */}
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900">Created</dt>
                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <span className="grow">
                    {job?.createdAt
                      ? new Date(job.createdAt).toLocaleDateString()
                      : "Loading..."}
                  </span>
                </dd>
              </div>

              {/* Location with Google Maps integration */}
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900">
                  Location
                </dt>
                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {job?.location ? (
                    <div className="flex flex-col gap-2">
                      <span className="grow">
                        {job.location.address}, {job.location.city},{" "}
                        {job.location.postcode}
                      </span>
                      {mapElement}
                    </div>
                  ) : (
                    <span className="text-gray-500">
                      Location not available
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Application modal component */}
      {job && (
        <ApplyJob applyOpen={applyOpen} setApplyOpen={setApplyOpen} job={job} />
      )}
    </div>
  );
}

// Main FindWorkJobDetail page component with context providers
// Wraps content with LocationProvider and JobProvider for data access
export default function FindWorkJobDetail() {
  return (
    <LocationProvider>
      <JobProvider>
        <FindWorkJobDetailContent />
      </JobProvider>
    </LocationProvider>
  );
}

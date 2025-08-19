import { useParams, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { useAuth } from "../../../contexts/AuthContext";
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import Loader from "../../../components/UI/Loader";
import JobStatusIndicator from "../../../components/UI/JobStatusIndicator";

const formatDateTime = (dateString) => {
  if (!dateString) return "Not specified";
  const date = new Date(dateString);
  return date.toLocaleString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (dateString) => {
  if (!dateString) return "Not specified";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (dateString) => {
  if (!dateString) return "Not specified";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MyJobApplicationDetail() {
  const { jobId } = useParams();
  const { currentUser } = useAuth();
  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("MyJobApplicationDetail rendered with jobId:", jobId);
  console.log("Current user:", currentUser?.uid);

  // Fetch application and job data
  useEffect(() => {
    console.log(
      "useEffect triggered with jobId:",
      jobId,
      "currentUser:",
      currentUser?.uid
    );

    if (!jobId || !currentUser?.uid) {
      console.log("Missing jobId or currentUser, returning early");
      setError("Missing job ID or user not authenticated");
      setLoading(false);
      return;
    }

    const db = getDatabase();
    let isMounted = true; // Track if component is still mounted

    // Increase timeout to 30 seconds and add better error handling
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.log("Timeout reached - setting error");
        setError("Loading timeout - please try again");
        setLoading(false);
      }
    }, 30000); // 30 second timeout

    // Fetch data using one-time get instead of real-time listener
    const fetchData = async () => {
      try {
        console.log("Starting data fetch for jobId:", jobId);

        // First, try to fetch the job data directly with timeout
        const jobRef = ref(db, `public/jobs/${jobId}`);
        const jobSnapshot = await Promise.race([
          get(jobRef),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Job fetch timeout")), 15000)
          ),
        ]);

        if (!isMounted) return; // Check if component is still mounted

        if (jobSnapshot.exists()) {
          const jobData = jobSnapshot.val();
          console.log("Found job data:", jobData);
          setJob(jobData);

          // Fetch business data if available with timeout
          if (jobData.businessId) {
            try {
              const businessRef = ref(
                db,
                `public/businesses/${jobData.businessId}`
              );
              const businessSnapshot = await Promise.race([
                get(businessRef),
                new Promise((_, reject) =>
                  setTimeout(
                    () => reject(new Error("Business fetch timeout")),
                    10000
                  )
                ),
              ]);

              if (!isMounted) return;

              if (businessSnapshot.exists()) {
                setBusiness(businessSnapshot.val());
              }
            } catch (businessError) {
              console.warn("Could not fetch business data:", businessError);
              // Don't fail the entire operation for business data
            }
          }
        } else {
          console.log("Job not found in public jobs");
        }

        // Now fetch the user's application data with timeout
        const applicationRef = ref(db, `users/${currentUser.uid}/jobs/applied`);
        const applicationsSnapshot = await Promise.race([
          get(applicationRef),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Application fetch timeout")),
              15000
            )
          ),
        ]);

        if (!isMounted) return;

        if (applicationsSnapshot.exists()) {
          const applications = applicationsSnapshot.val();
          console.log("Found applications:", applications);

          // Find the specific application by jobId
          let applicationEntry = null;

          // Try to find by jobId in the values
          applicationEntry = Object.values(applications).find(
            (app) => app.jobId === jobId
          );

          // If not found, try to find by checking if the jobId matches any key
          if (!applicationEntry) {
            applicationEntry = Object.entries(applications).find(
              ([key, app]) => app.jobId === jobId || key === jobId
            )?.[1];
          }

          if (applicationEntry) {
            console.log("Found application entry:", applicationEntry);
            setApplication(applicationEntry);
          } else {
            console.log("No application found, creating fallback");
            // Create fallback application from job data
            if (jobSnapshot.exists()) {
              const fallbackApplication = {
                jobId: jobId,
                jobTitle: jobData.jobTitle || "Unknown Job",
                businessName: jobData.businessName || "Unknown Business",
                startOfShift: jobData.startOfShift,
                endOfShift: jobData.endOfShift,
                payRate: jobData.payRate,
                appliedAt: jobData.createdAt || new Date().toISOString(),
                status: jobData.status || "Unknown",
                message: "Application details not available",
              };
              setApplication(fallbackApplication);
            }
          }
        } else {
          console.log("No applications found, creating fallback");
          // Create fallback application from job data
          if (jobSnapshot.exists()) {
            const fallbackApplication = {
              jobId: jobId,
              jobTitle: jobData.jobTitle || "Unknown Job",
              businessName: jobData.businessName || "Unknown Business",
              startOfShift: jobData.startOfShift,
              endOfShift: jobData.endOfShift,
              payRate: jobData.payRate,
              appliedAt: jobData.createdAt || new Date().toISOString(),
              status: jobData.status || "Unknown",
              message: "Application details not available",
            };
            setApplication(fallbackApplication);
          }
        }

        // Clear the main timeout since we succeeded
        clearTimeout(timeoutId);

        // Always set loading to false
        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error in data fetching:", error);
        if (isMounted) {
          setError("Failed to load data: " + error.message);
          setLoading(false);
        }
      }
    };

    // Start the data fetching
    fetchData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [jobId, currentUser?.uid]);

  console.log(
    "Rendering component - loading:",
    loading,
    "error:",
    error,
    "application:",
    application
  );

  if (loading) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader size="2xl" text="Loading application details..." />
          <p className="mt-4 text-sm text-gray-500">Job ID: {jobId}</p>
          <p className="text-sm text-gray-500">User ID: {currentUser?.uid}</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">
            {error || "Application not found"}
          </div>
          <NavLink
            to="/jobs/overview"
            className="text-indigo-600 hover:text-indigo-500"
          >
            ← Back to My Jobs
          </NavLink>
        </div>
      </div>
    );
  }

  // Determine the current section based on application status
  const getCurrentSection = () => {
    if (application.status === "Accepted") return "accepted";
    if (job?.status === "Open") return "active";
    if (job?.status === "Closed" || job?.status === "Filled") return "rejected";

    // If we have a job but no application status, check if it's an active job
    if (job && !application.status) {
      if (job.status === "Open") return "active";
      if (job.status === "Closed" || job.status === "Filled") return "rejected";
    }

    return "overview";
  };

  const currentSection = getCurrentSection();

  return (
    <div className="animate-[fadeIn_0.6s_ease-in-out]">
      {/* Header */}
      <div className="mb-6">
        <NavLink
          to={`/jobs/${currentSection}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to{" "}
          {currentSection.charAt(0).toUpperCase() +
            currentSection.slice(1)}{" "}
          Jobs
        </NavLink>
      </div>

      {/* Job Title and Status */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {job?.jobTitle || application.jobTitle}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {business?.name || application.businessName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <JobStatusIndicator
                job={job || application}
                showAutoCloseWarning={currentSection === "active"}
              />
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(job?.startOfShift || application.startOfShift)}
              </p>
              <p className="text-xs text-gray-500">
                {formatTime(job?.startOfShift || application.startOfShift)} -{" "}
                {formatTime(job?.endOfShift || application.endOfShift)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {business?.city || "Location"}
              </p>
              <p className="text-xs text-gray-500">
                {business?.address &&
                  `${business.address}, ${business.postcode}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BanknotesIcon className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                £{parseFloat(job?.payRate || application.payRate).toFixed(2)}/hr
              </p>
              <p className="text-xs text-gray-500">Pay Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Details */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Application Details
          </h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Applied On
              </h3>
              <p className="text-gray-900">
                {formatDateTime(application.appliedAt)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Application ID
              </h3>
              <p className="text-gray-900 font-mono text-sm">
                {application.applicationId}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Your Message
              </h3>
              <p className="text-gray-900">
                {application.message || "No message provided"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Application Status
              </h3>
              <p className="text-gray-900">{application.status || "Pending"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shift Details */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Shift Details</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Original Schedule
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Start:</span>
                  <p className="text-gray-900">
                    {formatDateTime(
                      job?.startOfShift || application.startOfShift
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">End:</span>
                  <p className="text-gray-900">
                    {formatDateTime(job?.endOfShift || application.endOfShift)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Pay Rate:</span>
                  <p className="text-gray-900">
                    £
                    {parseFloat(job?.payRate || application.payRate).toFixed(2)}
                    /hr
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Your Preferences
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Start Time:</span>
                  <p className="text-gray-900">
                    {application.usedOriginalTimes
                      ? "Using original time"
                      : formatDateTime(application.startOfShift)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">End Time:</span>
                  <p className="text-gray-900">
                    {application.usedOriginalTimes
                      ? "Using original time"
                      : formatDateTime(application.endOfShift)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Pay Rate:</span>
                  <p className="text-gray-900">
                    {application.usedOriginalPay
                      ? "Using original rate"
                      : `£${parseFloat(application.payRate).toFixed(2)}/hr`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Information */}
      {business && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Business Information
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Business Name
                </h3>
                <p className="text-gray-900">{business.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Location
                </h3>
                <div className="text-gray-900">
                  {business.address && <p>{business.address}</p>}
                  {business.city && <p>{business.city}</p>}
                  {business.postcode && <p>{business.postcode}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Information */}
      {currentSection === "accepted" && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Acceptance Details
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Verification Code
                </h3>
                {job?.verificationCode ? (
                  <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 inline-block">
                    <span className="text-blue-600 font-mono font-bold">
                      {job.verificationCode}
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-500">No verification code yet</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Accepted On
                </h3>
                <p className="text-gray-900">
                  {job?.acceptedAt
                    ? formatDateTime(job.acceptedAt)
                    : "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

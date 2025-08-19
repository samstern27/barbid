import { useBusiness } from "../../../contexts/BusinessContext";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, get, update } from "firebase/database";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";

// Generate a random 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default function MyBusinessJobListingsApplicantsDetail() {
  const { applicationId, jobId } = useParams();
  const { selectedBusiness, loading: businessLoading } = useBusiness();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [showConfirmAccept, setShowConfirmAccept] = useState(false);

  // Check if business is loaded
  if (businessLoading) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">Loading business...</div>
      </div>
    );
  }

  // Check if business is selected
  if (!selectedBusiness) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <div className="text-red-500 text-lg">No business selected</div>
        <NavLink
          to="/my-business"
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          Back to My Business
        </NavLink>
      </div>
    );
  }

  useEffect(() => {
    if (!jobId || !applicationId || !selectedBusiness?.id) {
      setError("Missing required parameters");
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const jobRef = ref(db, `public/jobs/${jobId}`);
    const applicationsRef = ref(db, `public/jobs/${jobId}/jobApplications`);

    let jobLoaded = false;
    let applicantLoaded = false;

    const checkIfComplete = () => {
      if (jobLoaded && applicantLoaded) {
        setLoading(false);
      }
    };

    // Fetch job data
    const unsubscribeJob = onValue(jobRef, (snapshot) => {
      if (snapshot.exists()) {
        const jobData = snapshot.val();
        setJob({
          id: jobId,
          ...jobData,
          applicantCount: jobData.applicantCount || 0,
        });
        jobLoaded = true;
      } else {
        setError("Job not found");
        jobLoaded = true;
      }
      checkIfComplete();
    });

    // Fetch all applications to find the specific applicant
    const unsubscribeApplications = onValue(
      applicationsRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const applications = snapshot.val();
          // Find the application by applicationId
          const applicationEntry = Object.entries(applications).find(
            ([_, application]) => application.applicationId === applicationId
          );

          if (applicationEntry) {
            const [userId, applicationData] = applicationEntry;

            // Fetch current user profile data for additional details
            try {
              const userProfileRef = ref(db, `users/${userId}/profile`);
              const userProfileSnapshot = await get(userProfileRef);
              const userProfile = userProfileSnapshot.val() || {};

              setApplicant({
                userId,
                ...applicationData,
                profile: userProfile,
              });
            } catch (error) {
              console.error(`Error fetching data for user ${userId}:`, error);
              setApplicant({
                userId,
                ...applicationData,
                profile: {},
              });
            }
          } else {
            setError("Applicant not found");
          }
        } else {
          setError("No applications found");
        }
        applicantLoaded = true;
        checkIfComplete();
      }
    );

    return () => {
      unsubscribeJob();
      unsubscribeApplications();
    };
  }, [jobId, applicationId, selectedBusiness?.id]);

  // Show confirmation dialog
  const handleAcceptClick = () => {
    setShowConfirmAccept(true);
  };

  // Accept application function
  const handleAcceptApplication = async () => {
    if (!job || !applicant || !selectedBusiness) return;

    setAccepting(true);
    setError(""); // Clear any previous errors
    setShowConfirmAccept(false); // Close confirmation dialog

    try {
      const db = getDatabase();

      // Generate a unique verification code for this acceptance
      const verificationCode = generateVerificationCode();

      console.log(
        "Accepting application for job:",
        jobId,
        "with verification code:",
        verificationCode
      );

      // Only update the public job listing - this is accessible to everyone
      const publicJobRef = ref(db, `public/jobs/${jobId}`);
      await update(publicJobRef, {
        status: "Filled",
        acceptedUserId: applicant.userId,
        acceptedPayRate: applicant.payRate,
        acceptedStartTime: applicant.startOfShift,
        acceptedEndTime: applicant.endOfShift,
        acceptedAt: new Date().toISOString(),
        verificationCode: verificationCode, // Store the verification code
      });

      console.log("Job status updated to Filled");

      // Update the applicant's application status in the public job
      const applicationRef = ref(
        db,
        `public/jobs/${jobId}/jobApplications/${applicant.userId}`
      );
      await update(applicationRef, {
        status: "Accepted",
        acceptedAt: new Date().toISOString(),
        verificationCode: verificationCode, // Store the verification code here too
      });

      console.log("Application status updated to Accepted");

      // Note: We can't update the user's applied job status from here because
      // we don't have permission to write to other users' data.
      // The user will see their application was accepted through the public job status change.

      // Wait a moment for the database updates to propagate
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success! Navigate back to applicants list
      navigate(
        `/my-business/${selectedBusiness.id}/job-listings/${jobId}/applicants`
      );
    } catch (error) {
      console.error("Error accepting application:", error);
      setError("Failed to accept application. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">
          Loading applicant details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <div className="text-red-500 text-lg">{error}</div>
        <NavLink
          to={`/my-business/${selectedBusiness.id}/job-listings/${jobId}/applicants`}
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          Back to Applicants
        </NavLink>
      </div>
    );
  }

  if (!applicant || !job) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">Applicant or job not found</div>
      </div>
    );
  }

  // Debug: log applicant data
  console.log("Applicant data for profile button:", {
    userId: applicant.userId,
    username: applicant.username,
    profile: applicant.profile,
  });

  // Helper function to format date and time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to calculate initials with proper uppercase
  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return "N/A";

    const first = firstName ? firstName.charAt(0).toUpperCase() : "";
    const last = lastName ? lastName.charAt(0).toUpperCase() : "";

    if (first && last) {
      return `${first}.${last}.`;
    } else if (first) {
      return `${first}.`;
    } else if (last) {
      return `${last}.`;
    }

    return "N/A";
  };

  // Check if pay rate differs from original
  const payRateDiffers = applicant.payRate !== job.payRate;
  const startTimeDiffers = applicant.startOfShift !== job.startOfShift;
  const endTimeDiffers = applicant.endOfShift !== job.endOfShift;

  return (
    <div>
      {/* Navigation */}
      <NavLink
        to={`/my-business/${selectedBusiness?.id}/job-listings/${jobId}/applicants`}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-8"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Applicants
      </NavLink>

      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              {applicant.profile?.avatar ? (
                <img
                  src={applicant.profile.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-indigo-100 flex items-center justify-center rounded-full">
                  <span className="text-2xl font-semibold text-indigo-600">
                    {getInitials(
                      applicant.profile?.firstName,
                      applicant.profile?.lastName
                    )}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getInitials(
                  applicant.profile?.firstName,
                  applicant.profile?.lastName
                )}
              </h1>
              <p className="text-gray-600">@{applicant.username}</p>
              <div className="flex items-center gap-3 mt-1">
                {applicant.profile?.occupation && (
                  <p className="text-gray-500">
                    {applicant.profile.occupation}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* View Profile Button */}
          <NavLink
            to={`/profile/${applicant?.username || "unknown"}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            View Profile
          </NavLink>
        </div>
      </div>

      {/* Application Details */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Application Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pay Rate */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Pay Rate</h3>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">
                £{applicant.payRate}/hr
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  payRateDiffers
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {payRateDiffers ? "Modified" : "Original Rate"}
              </span>
            </div>
            {payRateDiffers && (
              <p className="text-sm text-gray-500">
                Original: £{job.payRate}/hr
              </p>
            )}
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Start Time</h3>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">
                {formatDateTime(applicant.startOfShift)}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  startTimeDiffers
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {startTimeDiffers ? "Modified" : "Original Time"}
              </span>
            </div>
            {startTimeDiffers && (
              <p className="text-sm text-gray-500">
                Original: {formatDateTime(job.startOfShift)}
              </p>
            )}
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">End Time</h3>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">
                {formatDateTime(applicant.endOfShift)}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  endTimeDiffers
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {endTimeDiffers ? "Modified" : "Original Time"}
              </span>
            </div>
            {endTimeDiffers && (
              <p className="text-sm text-gray-500">
                Original: {formatDateTime(job.endOfShift)}
              </p>
            )}
          </div>

          {/* Applied Date */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Applied On</h3>
            <span className="text-lg font-semibold text-gray-900">
              {formatDateTime(applicant.appliedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Message */}
      {applicant.message && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Message from Applicant
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {applicant.message}
            </p>
          </div>
        </div>
      )}

      {/* Accept Application Button */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleAcceptClick}
            disabled={
              accepting ||
              job.status === "Filled" ||
              job.status === "Completed" ||
              job.acceptedUserId
            }
            className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
              job.status === "Filled" ||
              job.status === "Completed" ||
              job.acceptedUserId
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <CheckIcon className="w-5 h-5" />
            {accepting
              ? "Accepting..."
              : job.status === "Filled" ||
                job.status === "Completed" ||
                job.acceptedUserId
              ? "Job Filled"
              : "Accept Application"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-2">
          {job.status === "Filled" ||
          job.status === "Completed" ||
          job.acceptedUserId
            ? "This job has already been filled and cannot accept more applications."
            : "This will accept the applicant for the position and close the job listing"}
        </p>
        {error && (
          <p className="text-center text-sm text-red-500 mt-2">{error}</p>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmAccept && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Accept Application
              </h3>
              <div className="mt-2 px-7">
                <p className="text-sm text-gray-500">
                  Are you sure you want to accept{" "}
                  {applicant?.firstName || applicant?.username}'s application
                  for this position?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This will close the job listing and prevent other applications
                  from being accepted.
                </p>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowConfirmAccept(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAcceptApplication}
                disabled={accepting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {accepting ? "Accepting..." : "Yes, Accept"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useParams, NavLink } from "react-router-dom";
import { useBusiness } from "../../../contexts/BusinessContext";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, get } from "firebase/database";
import Loader from "../../../components/UI/Loader";

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

export default function MyBusinessPreviousStaffDetail() {
  const { businessId, shiftId } = useParams();
  const { selectedBusiness } = useBusiness();
  const [shift, setShift] = useState(null);
  const [staffProfile, setStaffProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch shift and staff data
  useEffect(() => {
    if (!businessId || !shiftId) return;

    const db = getDatabase();

    // Parse the shiftId to get jobId and userId
    const [jobId, userId] = shiftId.split("_");

    if (!jobId || !userId) {
      setError("Invalid shift ID");
      setLoading(false);
      return;
    }

    // Fetch the job application data
    const applicationRef = ref(
      db,
      `public/jobs/${jobId}/jobApplications/${userId}`
    );
    const jobRef = ref(db, `public/jobs/${jobId}`);

    let applicationUnsubscribe;
    let jobUnsubscribe;

    const fetchShiftData = async () => {
      try {
        // Listen to application changes
        applicationUnsubscribe = onValue(
          applicationRef,
          async (applicationSnapshot) => {
            if (applicationSnapshot.exists()) {
              const applicationData = applicationSnapshot.val();

              // Only proceed if applicant actually attended
              // Check both fields: 'attended' (set by verification) and 'applicantAttended' (set on job level)
              const hasAttended =
                applicationData.attended === true ||
                applicationData.applicantAttended === true;

              // Debug logging to help troubleshoot attendance issues
              console.log("Attendance check for shift:", {
                shiftId,
                jobId,
                userId,
                applicationAttended: applicationData.attended,
                applicationApplicantAttended: applicationData.applicantAttended,
                hasAttended,
                applicationData: applicationData,
              });

              if (!hasAttended) {
                setError("Applicant did not attend this shift");
                setLoading(false);
                return;
              }

              // Fetch job data
              const jobSnapshot = await get(jobRef);
              if (jobSnapshot.exists()) {
                const jobData = jobSnapshot.val();

                // Combine job and application data
                const shiftData = {
                  id: shiftId,
                  jobId,
                  userId,
                  jobTitle: jobData.jobTitle,
                  businessName: jobData.businessName,
                  businessLocation: jobData.location,
                  originalStartTime: jobData.startOfShift,
                  originalEndTime: jobData.endOfShift,
                  originalPayRate: jobData.payRate,
                  actualStartTime:
                    applicationData.actualStartTime ||
                    applicationData.startOfShift,
                  actualEndTime:
                    applicationData.actualEndTime || applicationData.endOfShift,
                  actualPayRate:
                    applicationData.actualPayRate || applicationData.payRate,
                  verificationCode: applicationData.verificationCode,
                  completedAt:
                    applicationData.completedAt || applicationData.attendedAt,
                  shiftDate: jobData.startOfShift,
                  notes: applicationData.notes,
                  ...applicationData,
                };

                setShift(shiftData);

                // Fetch staff profile data
                const userProfileRef = ref(db, `users/${userId}/profile`);
                const userProfileSnapshot = await get(userProfileRef);
                const userProfile = userProfileSnapshot.val() || {};

                setStaffProfile({
                  ...userProfile,
                });
              } else {
                setError("Job not found");
              }
            } else {
              setError("Application not found");
            }
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Error fetching shift data:", error);
        setError("Failed to load shift data");
        setLoading(false);
      }
    };

    fetchShiftData();

    return () => {
      if (applicationUnsubscribe) {
        applicationUnsubscribe();
      }
      if (jobUnsubscribe) {
        jobUnsubscribe();
      }
    };
  }, [businessId, shiftId]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <Loader size="lg" text="Loading shift details..." />
      </div>
    );
  }

  if (error || !shift) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">
          {error || "Shift not found"}
        </div>
        <NavLink
          to={`/my-business/${businessId}/previous-staff`}
          className="mt-4 text-indigo-600 hover:text-indigo-700"
        >
          Back to Previous Staff
        </NavLink>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <NavLink
          to={`/my-business/${businessId}/previous-staff`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Previous Staff
        </NavLink>

        <NavLink
          to={`/my-business/${businessId}/job-listings/${shift.jobId}/applicants`}
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
        >
          Back to Applicants
        </NavLink>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            Shift Details - {shift.jobTitle}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Completed by{" "}
            {staffProfile?.firstName && staffProfile?.lastName
              ? `${staffProfile.firstName} ${staffProfile.lastName}`
              : staffProfile?.firstName ||
                staffProfile?.lastName ||
                "Unknown Name"}{" "}
            at {selectedBusiness?.name}
          </p>
        </div>

        <div className="px-6 py-4">
          {/* Staff Information */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Staff Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4">
                <img
                  alt=""
                  src={
                    staffProfile?.profilePicture ||
                    staffProfile?.avatar ||
                    "/src/assets/user.png"
                  }
                  className="size-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {staffProfile?.firstName && staffProfile?.lastName
                      ? `${staffProfile.firstName} ${staffProfile.lastName}`
                      : staffProfile?.firstName ||
                        staffProfile?.lastName ||
                        "Unknown Name"}
                  </h3>
                  <p className="text-gray-600">
                    @{staffProfile?.username || "Unknown"}
                  </p>
                  <p className="text-gray-600">
                    {staffProfile?.occupation || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shift Details */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Shift Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Times */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-700">
                  Original Schedule
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Start Time:
                    </span>
                    <p className="text-gray-900">
                      {formatDateTime(shift.originalStartTime)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      End Time:
                    </span>
                    <p className="text-gray-900">
                      {formatDateTime(shift.originalEndTime)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Pay Rate:
                    </span>
                    <p className="text-gray-900">£{shift.originalPayRate}/hr</p>
                  </div>
                </div>
              </div>

              {/* Actual Times */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-700">
                  Actual Work
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Start Time:
                    </span>
                    <p className="text-gray-900">
                      {formatDateTime(shift.actualStartTime)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      End Time:
                    </span>
                    <p className="text-gray-900">
                      {formatDateTime(shift.actualEndTime)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Pay Rate:
                    </span>
                    <p className="text-gray-900">£{shift.actualPayRate}/hr</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Job Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Job Title:
                </span>
                <p className="text-gray-900">{shift.jobTitle}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Business Location:
                </span>
                <p className="text-gray-900">
                  {shift.businessLocation ? (
                    <span>
                      {shift.businessLocation.address && (
                        <span className="block">
                          {shift.businessLocation.address}
                        </span>
                      )}
                      {shift.businessLocation.city && (
                        <span className="block">
                          {shift.businessLocation.city}
                        </span>
                      )}
                      {shift.businessLocation.postcode && (
                        <span className="block">
                          {shift.businessLocation.postcode}
                        </span>
                      )}
                    </span>
                  ) : (
                    "Not specified"
                  )}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Shift Date:
                </span>
                <p className="text-gray-900">
                  {formatDateTime(shift.shiftDate)}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Completed At:
                </span>
                <p className="text-gray-900">
                  {formatDateTime(shift.completedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Details */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Verification Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Verification Code:
                </span>
                <p className="text-gray-900 font-mono">
                  {shift.verificationCode || "Not specified"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Status:
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {shift.notes && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Additional Notes
              </h2>
              <p className="text-gray-700">{shift.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useParams, NavLink } from "react-router-dom";
import { useBusiness } from "../../../contexts/BusinessContext";
import { ArrowLeftIcon, EyeIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, get } from "firebase/database";
import Loader from "../../../components/UI/Loader";

// Utility function to format relative time for shift completion timestamps
// Converts dates to human-readable relative time (e.g., "2 hours ago")
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
};

// MyBusinessPreviousStaff component for viewing completed shifts and staff history
// Features shift completion tracking, staff data enrichment, and historical reporting
export default function MyBusinessPreviousStaff() {
  const { businessId } = useParams();
  const { selectedBusiness } = useBusiness();
  const [completedShifts, setCompletedShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize database reference at component level
  const db = getDatabase();

  // Fetch completed shifts data
  useEffect(() => {
    if (!businessId) return;

    // Fetch all jobs for this business first
    const jobsRef = ref(db, `public/jobs`);

    const unsubscribeJobs = onValue(jobsRef, async (snapshot) => {
      if (snapshot.exists()) {
        const jobsData = snapshot.val();
        const businessJobs = [];

        // Processing jobs for Previous Staff check

        // Filter jobs for this business
        Object.keys(jobsData).forEach((jobId) => {
          const job = jobsData[jobId];
          if (job.businessId === businessId) {
            // Only include jobs that have an end time
            if (job.endOfShift) {
              businessJobs.push({ jobId, ...job });
            }
          }
        });

        // Found jobs for business

        // Now fetch applications for each job and check for completed shifts
        const completedShifts = [];

        for (const job of businessJobs) {
          const applicationsRef = ref(
            db,
            `public/jobs/${job.jobId}/jobApplications`
          );
          const applicationsSnapshot = await get(applicationsRef);

          if (applicationsSnapshot.exists()) {
            const applications = applicationsSnapshot.val();

            Object.keys(applications).forEach((userId) => {
              const application = applications[userId];

              // Check if this is a completed shift:
              // 1. Job has passed its end time
              // 2. Job was accepted/filled by this user
              // 3. OR user marked as attended
              // 4. OR job status is Completed
              const now = new Date();
              const jobEndTime = new Date(job.endOfShift);
              const shiftHasPassed = now > jobEndTime;

              // Add some tolerance - consider a shift "passed" if it's been more than 5 minutes since end time
              const toleranceMs = 5 * 60 * 1000; // 5 minutes
              const shiftHasPassedWithTolerance =
                now > jobEndTime.getTime() + toleranceMs;

              const isAcceptedUser = job.acceptedUserId === userId;
              const isAttended = application.attended === true;
              const isCompleted = job.status === "Completed";
              const isFilled = job.status === "Filled";

              // Additional checks for attendance
              const isAttendedOnJob = job.applicantAttended === true;
              const isAttendedAnywhere = isAttended || isAttendedOnJob;

              // Additional check: if the job was accepted by this user, it should show up
              // even if the status hasn't been updated yet
              const wasAccepted = application.status === "Accepted";

              // Job processing completed

              if (
                shiftHasPassedWithTolerance &&
                (isAcceptedUser ||
                  isAttendedAnywhere ||
                  isCompleted ||
                  isFilled ||
                  wasAccepted)
              ) {
                completedShifts.push({
                  shiftId: `${job.jobId}_${userId}`, // Create unique shift ID
                  jobId: job.jobId,
                  jobTitle: job.jobTitle,
                  businessName: job.businessName,
                  userId: userId,
                  endOfShift: job.endOfShift,
                  completedAt: job.completedAt || job.endOfShift, // Use completedAt if available, otherwise endOfShift
                  ...application,
                });
              }
            });
          }
        }

        // Found completed shifts for business
        setCompletedShifts(completedShifts);
      } else {
        setCompletedShifts([]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeJobs();
    };
  }, [businessId]);

  // State to store enriched staff data
  const [enrichedStaff, setEnrichedStaff] = useState([]);

  // Fetch staff data for each completed shift
  useEffect(() => {
    if (!completedShifts || completedShifts.length === 0) {
      setEnrichedStaff([]);
      return;
    }

    const fetchStaffData = async () => {
      if (!completedShifts.length) return;

      const enrichedData = await Promise.all(
        completedShifts.map(async (shift) => {
          const userId = shift.userId;
          const userProfileRef = ref(db, `users/${userId}/profile`);
          const userProfileSnapshot = await get(userProfileRef);
          const userProfile = userProfileSnapshot.val() || {};

          return {
            ...shift,
            username: userProfile.username || "Unknown",
            occupation: userProfile.occupation || "Not specified",
            image:
              userProfile.profilePicture ||
              userProfile.avatar ||
              "/src/assets/user.png",
            fullName:
              userProfile.firstName && userProfile.lastName
                ? `${userProfile.firstName} ${userProfile.lastName}`
                : userProfile.firstName ||
                  userProfile.lastName ||
                  "Unknown Name",
            completed: formatRelativeTime(shift.completedAt),
          };
        })
      );

      setEnrichedStaff(enrichedData);
    };

    fetchStaffData();
  }, [completedShifts]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <Loader size="2xl" text="Loading completed shifts..." />
      </div>
    );
  }

  return (
    <div>
      <NavLink
        to={`/my-business/${businessId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Business Overview
      </NavLink>
      <div className="mt-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900">
              Previous Staff at {selectedBusiness?.name || "Your Business"}
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all staff who have completed shifts at your business.
            </p>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="relative min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Username
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Occupation
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Job Title
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Completed
                    </th>
                    <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-0">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {enrichedStaff.length > 0 ? (
                    enrichedStaff.map((staff, index) => (
                      <tr key={staff.shiftId || index}>
                        <td className="py-5 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-0">
                          <div className="flex items-center">
                            <div className="size-11 shrink-0">
                              <img
                                alt=""
                                src={staff.image}
                                className="size-11 rounded-full"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">
                                @{staff.username}
                              </div>
                              <div className="mt-1 text-gray-500">
                                {staff.fullName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
                          <div className="text-gray-900">
                            {staff.occupation}
                          </div>
                        </td>
                        <td className="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
                          {staff.jobTitle || "Not specified"}
                        </td>
                        <td className="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
                          {staff.completed}
                        </td>
                        <td className="py-5 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
                          <NavLink
                            to={`/my-business/${businessId}/previous-staff/${staff.shiftId}`}
                            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
                          >
                            <EyeIcon className="w-4 h-4" />
                            View Details
                            <span className="sr-only">, {staff.fullName}</span>
                          </NavLink>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-3 py-8 text-center text-gray-500"
                      >
                        {completedShifts.length === 0
                          ? "No completed shifts yet"
                          : "Loading staff data..."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

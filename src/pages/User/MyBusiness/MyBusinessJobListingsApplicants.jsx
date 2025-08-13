import { useParams, NavLink } from "react-router-dom";
import { useBusiness } from "../../../contexts/BusinessContext";
import { ArrowLeftIcon, EyeIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, get } from "firebase/database";
import StarRating from "../../../components/UI/StarRating";

export default function MyBusinessJobListingsApplicants() {
  const { jobId } = useParams();
  const { selectedBusiness } = useBusiness();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log(job);

  // Fetch job data
  useEffect(() => {
    if (!jobId) return;

    const db = getDatabase();
    const jobRef = ref(db, `public/jobs/${jobId}`);
    const applicationsRef = ref(db, `public/jobs/${jobId}/jobApplications`);

    // Fetch job data
    const unsubscribeJob = onValue(jobRef, (snapshot) => {
      if (snapshot.exists()) {
        setJob({ id: jobId, ...snapshot.val() });
      }
      setLoading(false);
    });

    // Fetch applications
    const unsubscribeApplications = onValue(applicationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert Firebase object to array
        const applicationsArray = Object.keys(data).map((userId) => ({
          userId,
          ...data[userId],
        }));
        setApplications(applicationsArray);
      } else {
        setApplications([]);
      }
    });

    return () => {
      unsubscribeJob();
      unsubscribeApplications();
    };
  }, [jobId]);

  // State to store enriched applicant data
  const [enrichedApplicants, setEnrichedApplicants] = useState([]);

  // Fetch current user data for each applicant
  useEffect(() => {
    if (!applications || applications.length === 0) {
      setEnrichedApplicants([]);
      return;
    }

    const fetchApplicantData = async () => {
      const db = getDatabase();
      const enrichedData = await Promise.all(
        applications.map(async (application) => {
          try {
            // Fetch current user profile data for additional details
            const userProfileRef = ref(
              db,
              `users/${application.userId}/profile`
            );
            const userProfileSnapshot = await get(userProfileRef);
            const userProfile = userProfileSnapshot.val() || {};

            // Fetch user reviews to calculate average rating
            const userReviewsRef = ref(
              db,
              `users/${application.userId}/profile/reviews`
            );
            const userReviewsSnapshot = await get(userReviewsRef);
            const userReviews = userReviewsSnapshot.val() || {};

            // Calculate average rating
            const reviewValues = Object.values(userReviews);
            const averageRating =
              reviewValues.length > 0
                ? reviewValues.reduce(
                    (sum, review) => sum + (review.rating || 0),
                    0
                  ) / reviewValues.length
                : 0;

            // Calculate initials from firstName and lastName
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

            return {
              userId: application.userId,
              applicationId: application.applicationId,
              username: application.username || "Unknown",
              firstName: userProfile.firstName || application.firstName || "",
              lastName: userProfile.lastName || application.lastName || "",
              initials: getInitials(
                userProfile.firstName,
                userProfile.lastName
              ),
              occupation: userProfile.occupation || "N/A",
              rating: averageRating > 0 ? averageRating : 0,
              payRate: application.payRate
                ? `£${application.payRate}/hr`
                : "N/A",
              applied: application.appliedAt
                ? new Date(application.appliedAt).toLocaleDateString()
                : "N/A",
              image: userProfile.avatar || "/default-avatar.png",
              message: application.message || "",
              startOfShift: application.startOfShift,
              endOfShift: application.endOfShift,
            };
          } catch (error) {
            console.error(
              `Error fetching data for user ${application.userId}:`,
              error
            );
            // Return fallback data if there's an error
            return {
              userId: application.userId,
              applicationId: application.applicationId,
              username: application.username || "Unknown",
              firstName: application.firstName || "",
              lastName: application.lastName || "",
              initials: "N/A",
              occupation: "N/A",
              rating: 0,
              payRate: application.payRate
                ? `£${application.payRate}/hr`
                : "N/A",
              applied: application.appliedAt
                ? new Date(application.appliedAt).toLocaleDateString()
                : "N/A",
              image: "/default-avatar.png",
              message: application.message || "",
              startOfShift: application.startOfShift,
              endOfShift: application.endOfShift,
            };
          }
        })
      );

      setEnrichedApplicants(enrichedData);
    };

    fetchApplicantData();
  }, [applications]);

  console.log(enrichedApplicants);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">Loading job data...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">Job not found</div>
      </div>
    );
  }

  return (
    <div>
      <NavLink
        to={`/my-business/${selectedBusiness.id}/job-listings/${jobId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Job Details
      </NavLink>
      <div className="mt-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900">
              Applicants for {job.jobTitle} at {job.businessName}
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all the applicants for {job.jobTitle}.
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
                      Rate
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Applied
                    </th>
                    <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-0">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {enrichedApplicants.length > 0 ? (
                    enrichedApplicants.map((person, index) => (
                      <tr key={person.userId || index}>
                        <td className="py-5 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-0">
                          <div className="flex items-center">
                            <div className="size-11 shrink-0">
                              <img
                                alt=""
                                src={person.image}
                                className="size-11 rounded-full"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">
                                @{person.username}
                              </div>
                              <div className="mt-1 text-gray-500">
                                {person.initials}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
                          <div className="text-gray-900">
                            {person.occupation}
                          </div>
                          <div className="mt-1 text-gray-500">
                            <StarRating rating={person.rating} />
                          </div>
                        </td>
                        <td className="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
                          {person.payRate}
                        </td>
                        <td className="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
                          {person.applied}
                        </td>
                        <td className="py-5 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
                          <NavLink
                            to={`/my-business/${selectedBusiness.id}/job-listings/${jobId}/applicants/${person.applicationId}`}
                            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
                          >
                            <EyeIcon className="w-4 h-4" />
                            View Application
                            <span className="sr-only">, {person.initials}</span>
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
                        {applications.length === 0
                          ? "No applicants yet"
                          : "Loading applicant data..."}
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

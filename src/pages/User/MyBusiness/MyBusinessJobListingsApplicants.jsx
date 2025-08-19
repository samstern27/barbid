import { useParams, NavLink } from "react-router-dom";
import { useBusiness } from "../../../contexts/BusinessContext";
import { ArrowLeftIcon, EyeIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, get } from "firebase/database";

// Simple function to format relative time
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

export default function MyBusinessJobListingsApplicants() {
  const { jobId } = useParams();
  const { selectedBusiness } = useBusiness();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getDatabase();

  console.log(job);

  // Fetch job data
  useEffect(() => {
    if (!jobId) return;

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
      if (!applications.length) return;

      const enrichedData = await Promise.all(
        applications.map(async (application) => {
          const userId = application.userId;
          const userProfileRef = ref(db, `users/${userId}/profile`);
          const userProfileSnapshot = await get(userProfileRef);
          const userProfile = userProfileSnapshot.val() || {};

          return {
            ...application,
            username: userProfile.username || "Unknown",
            occupation: userProfile.occupation || "Not specified",
            image: userProfile.avatar || "/src/assets/user.png",
            initials:
              userProfile.firstName && userProfile.lastName
                ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`
                : "U",
            payRate: application.payRate || "Not specified",
            applied: formatRelativeTime(application.appliedAt),
          };
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
                        </td>
                        <td className="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
                          £{parseFloat(person.payRate).toFixed(2)}/hr
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

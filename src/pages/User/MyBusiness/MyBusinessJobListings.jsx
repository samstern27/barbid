import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CreateJob from "../../../components/User/MyBusiness/CreateJob";
import { useBusiness } from "../../../contexts/BusinessContext";
import { useAuth } from "../../../contexts/AuthContext";
import { EyeIcon } from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import Loader from "../../../components/UI/Loader";

export default function MyBusinessJobListings() {
  const [loading, setLoading] = useState(true);
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const { businessId } = useParams();
  const { currentUser } = useAuth();
  const { selectedBusiness } = useBusiness();

  useEffect(() => {
    // Set loading to false when we have either selectedBusiness or when we're sure it's loading
    if (selectedBusiness || !businessId) {
      setLoading(false);
    }
  }, [selectedBusiness, businessId]);

  return (
    <div className="animate-[fadeIn_0.6s_ease-in-out]">
      <div className="sm:flex sm:items-center bg-red-50 p-4 rounded-lg">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900">
            Job Listings
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage job listings for{" "}
            {selectedBusiness?.name || "your business"}.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setCreateJobOpen(true)}
            className="block rounded-md bg-red-500 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
          >
            Add Job Listing
          </button>
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
                    Applicants
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
                {selectedBusiness?.jobs &&
                typeof selectedBusiness.jobs === "object" &&
                Object.keys(selectedBusiness.jobs).length > 0 ? (
                  Object.keys(selectedBusiness.jobs).map((jobId) => {
                    const job = selectedBusiness.jobs[jobId];
                    return (
                      <tr key={jobId}>
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
                          {job.applicants || 0}
                        </td>
                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                              job.status === "Open"
                                ? "bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset"
                                : job.status === "Closed"
                                ? "bg-red-50 text-red-700 ring-1 ring-red-600/20 ring-inset"
                                : job.status === "Filled"
                                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 ring-inset"
                                : "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20 ring-inset"
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
                            to={`/my-business/${selectedBusiness.id}/job-listings/${jobId}`}
                            className="text-red-500 hover:text-red-600 flex items-center gap-2"
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
                      No job listings found. Create your first job listing
                      above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
      <CreateJob
        createJobOpen={createJobOpen}
        setCreateJobOpen={setCreateJobOpen}
      />
    </div>
  );
}

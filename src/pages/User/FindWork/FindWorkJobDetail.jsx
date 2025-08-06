import { useParams } from "react-router-dom";
import Breadcrumb from "../../../components/UI/Breadcrumb";
import { getDistance } from "../../../utils/getDistance.js";
import { LocationContext } from "../../../contexts/LocationContext";
import { useContext } from "react";
import { useBusiness } from "../../../contexts/BusinessContext";

export default function FindWorkJobDetail() {
  const { jobId } = useParams();
  const { publicJobs } = useBusiness();
  const { coords } = useContext(LocationContext);

  const job = publicJobs?.find((job) => job.id === jobId);

  // Calculate distance only if job and coords exist
  const distance =
    job && coords?.lat && coords?.lng && job.location?.lat && job.location?.lng
      ? getDistance(job.location.lat, job.location.lng, coords.lat, coords.lng)
      : null;

  const pages = [
    { name: "Find Work", href: "/find-work" },
    { name: "Job Detail", href: "#", current: true },
  ];

  // Show loading state if publicJobs is not loaded yet
  if (!publicJobs) {
    return (
      <div className="flex flex-col m-10 gap-4">
        <Breadcrumb pages={pages} />
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  // Show error state if job is not found
  if (!job) {
    return (
      <div className="flex flex-col m-10 gap-4">
        <Breadcrumb pages={pages} />
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Job Not Found</h1>
          <p className="text-gray-600">
            The job you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col m-10 gap-4">
      <Breadcrumb pages={pages} />
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">
          {job.businessName} - {job.jobTitle}
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Job Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Position:</span> {job.jobTitle}
                </div>
                <div>
                  <span className="font-medium">Business:</span>{" "}
                  {job.businessName}
                </div>
                <div>
                  <span className="font-medium">Pay Rate:</span> £{job.payRate}
                  /hour
                </div>
                <div>
                  <span className="font-medium">Shift:</span>{" "}
                  {job.startOfShift.split("T")[0]} at{" "}
                  {job.startOfShift.split("T")[1]} -{" "}
                  {job.endOfShift.split("T")[1]}
                </div>
                {distance && (
                  <div>
                    <span className="font-medium">Distance:</span>{" "}
                    {distance.toFixed(1)} km
                  </div>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Location</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Address:</span>{" "}
                  {job.location.address}
                </div>
                <div>
                  <span className="font-medium">City:</span> {job.location.city}
                </div>
                <div>
                  <span className="font-medium">Postcode:</span>{" "}
                  {job.location.postcode}
                </div>
              </div>
            </div>
          </div>
          {job.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Description</h2>
              <p className="text-gray-700">{job.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

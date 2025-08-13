import React from "react";
import FindWorkJob from "./FindWorkJob";
import { NavLink } from "react-router-dom";
import { useJob } from "../../../contexts/JobContext";
import { LocationContext } from "../../../contexts/LocationContext";
import Loader from "../../UI/Loader";
import { useState, useEffect, useContext, useMemo } from "react";
import getDistance from "../../../utils/getDistance";

const FindWorkDivider = React.memo(
  ({ sortMethod = "newest", filters = {} }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [showNoJobs, setShowNoJobs] = useState(false);
    const { publicJobs, closedJobs, filledJobs } = useJob();
    const { coords, locationError, isLocationLoading } =
      useContext(LocationContext);

    // Local loading state for location-dependent features
    const [locationReady, setLocationReady] = useState(false);

    // Handle location loading state
    useEffect(() => {
      if (coords.lat && coords.lng) {
        setLocationReady(true);
      }
    }, [coords.lat, coords.lng]);

    // Memoize the expensive sorting and filtering calculations
    const sortedJobs = useMemo(() => {
      if (!publicJobs || publicJobs.length === 0) return [];

      // Filter for only open jobs
      let jobs = publicJobs.filter((job) => job.status === "Open");

      if (jobs.length === 0) return [];

      // Calculate distances for all jobs if we have user location
      if (coords.lat && coords.lng) {
        jobs.forEach((job) => {
          if (job.location && job.location.lat && job.location.lng) {
            job.distance = getDistance(
              coords.lat,
              coords.lng,
              job.location.lat,
              job.location.lng
            );
          }
        });
      }

      // Apply filters
      jobs = jobs.filter((job) => {
        // Job position filter
        if (filters["job-position"] && filters["job-position"].length > 0) {
          const jobTitle = job.jobTitle?.toLowerCase() || "";
          const matchesPosition = filters["job-position"].some((position) =>
            jobTitle.includes(position.toLowerCase())
          );
          if (!matchesPosition) return false;
        }

        // Distance filter
        if (filters.distance && filters.distance.length > 0) {
          const selectedDistance = filters.distance[0];
          if (selectedDistance > 0) {
            if (!job.distance && job.distance !== 0) return false;

            if (selectedDistance === 101) {
              // 100km+ filter
              if (job.distance < 100) return false;
            } else {
              // Less than X km filters
              if (job.distance >= selectedDistance) return false;
            }
          }
        }

        // City filter
        if (filters.city && filters.city.length > 0) {
          const jobCity = job.location?.city?.toLowerCase() || "";
          const matchesCity = filters.city.some((city) =>
            jobCity.includes(city.toLowerCase())
          );
          if (!matchesCity) return false;
        }

        return true;
      });

      // Apply sorting
      switch (sortMethod) {
        case "closest":
          jobs.sort((a, b) => {
            if (!a.distance && !b.distance) return 0;
            if (!a.distance) return 1;
            if (!b.distance) return 1;
            return a.distance - b.distance;
          });
          break;

        case "highest-paying":
          jobs.sort((a, b) => {
            const payA = parseFloat(a.payRate) || 0;
            const payB = parseFloat(b.payRate) || 0;
            return payB - payA; // Highest first
          });
          break;

        case "newest":
          jobs.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA; // Newest first
          });
          break;

        case "least-applied":
          jobs.sort((a, b) => {
            const applicantsA = a.applicantCount || 0;
            const applicantsB = b.applicantCount || 0;
            return applicantsA - applicantsB; // Least applied first
          });
          break;

        default:
          break;
      }

      return jobs;
    }, [publicJobs, coords.lat, coords.lng, filters, sortMethod]);

    useEffect(() => {
      // When we get data from Firebase, check immediately
      if (publicJobs && isLoading) {
        setIsLoading(false);
        // Check if there are any open jobs after filtering
        const openJobs = publicJobs.filter((job) => job.status === "Open");
        if (openJobs.length === 0) {
          setShowNoJobs(true);
        }
      }
    }, [publicJobs]);

    // Show location loading if we need location for distance calculations
    if (isLocationLoading) {
      return (
        <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
          <Loader size="2xl" text="Getting your location..." />
        </div>
      );
    }

    // Show location error with fallback option
    if (locationError && !coords.lat) {
      return (
        <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">
              Location Error: {locationError}
            </div>
            <div className="text-gray-500 text-sm mb-4">
              Using default location (London) for distance calculations
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Retry Location
            </button>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
          <Loader size="2xl" text="Loading jobs..." />
        </div>
      );
    } else if (showNoJobs || (publicJobs && publicJobs.length === 0)) {
      return (
        <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="mx-auto size-12 text-gray-400 mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No open jobs available
            </h3>
            <p className="text-gray-500 text-sm">
              There are currently no open positions. Check back later for new
              opportunities.
            </p>
          </div>
        </div>
      );
    } else if (publicJobs && publicJobs.length > 0) {
      // Check if there are any open jobs after filtering and sorting
      if (sortedJobs.length === 0) {
        return (
          <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="mx-auto size-12 text-gray-400 mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No jobs match your criteria
              </h3>
              <p className="text-gray-500 text-sm">
                Try adjusting your filters or check back later for new
                opportunities.
              </p>
            </div>
          </div>
        );
      }

      return (
        <ul role="list" className="space-y-3 animate-[fadeIn_1.2s_ease-in-out]">
          {sortedJobs.map((job) => (
            <li
              key={job.id}
              className="overflow-hidden rounded-md bg-white px-6 py-4 shadow-sm hover:bg-gray-50 hover:cursor-pointer hover:shadow-md transition-all duration-300"
            >
              <NavLink to={`/find-work/${job.id}`} state={{ job: job }}>
                <FindWorkJob job={job} />
              </NavLink>
            </li>
          ))}
        </ul>
      );
    }

    // Fallback case
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-gray-500 text-lg">
            Something went wrong. Please try again.
          </div>
        </div>
      </div>
    );
  }
);

export default FindWorkDivider;

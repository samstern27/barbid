import React from "react";
import FindWorkJob from "./FindWorkJob";
import { NavLink } from "react-router-dom";
import { useJob } from "../../../contexts/JobContext";
import { LocationContext } from "../../../contexts/LocationContext";
import Loader from "../../UI/Loader";
import { useState, useEffect, useContext, useMemo } from "react";
import getDistance from "../../../utils/getDistance";

// Main job listing component that handles filtering, sorting, and rendering
// Uses React.memo for performance optimization since props rarely change
const FindWorkDivider = React.memo(
  ({ sortMethod = "newest", filters = {} }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [showNoJobs, setShowNoJobs] = useState(false);
    const { publicJobs, closedJobs, filledJobs } = useJob();
    const { coords, locationError, isLocationLoading } =
      useContext(LocationContext);

    // Local loading state for location-dependent features
    const [locationReady, setLocationReady] = useState(false);

    // Handle location loading state - set ready when coordinates are available
    useEffect(() => {
      if (coords.lat && coords.lng) {
        setLocationReady(true);
      }
    }, [coords.lat, coords.lng]);

    // Memoize the expensive sorting and filtering calculations
    // This prevents recalculating on every render, improving performance
    const sortedJobs = useMemo(() => {
      if (!publicJobs || publicJobs.length === 0) {
        return [];
      }

      // Filter for only open jobs
      let jobs = publicJobs.filter((job) => job.status === "Open");

      if (jobs.length === 0) {
        return [];
      }

      // Filter out jobs from private businesses
      jobs = jobs.filter((job) => {
        // If we can't determine business privacy, assume it's public (show the job)
        if (!job.businessPrivacy) {
          return true;
        }
        return job.businessPrivacy === "public";
      });

      if (jobs.length === 0) {
        return [];
      }

      // Calculate distances for all jobs if we have user location
      if (coords.lat && coords.lng) {
        let jobsWithDistance = 0;
        let jobsWithoutLocation = 0;

        jobs.forEach((job) => {
          if (job.location && job.location.lat && job.location.lng) {
            job.distance = getDistance(
              coords.lat,
              coords.lng,
              job.location.lat,
              job.location.lng
            );
            jobsWithDistance++;
          } else {
            jobsWithoutLocation++;
          }
        });
        // Distance calculation completed silently
      } else {
        // No user coordinates available, distance calculations skipped
      }

      // Apply filters based on user selections
      jobs = jobs.filter((job) => {
        // Job position filter - check if job title matches selected positions
        if (filters["job-position"] && filters["job-position"].length > 0) {
          const jobPosition = job.jobTitle?.toLowerCase() || "";
          const hasMatchingPosition = filters["job-position"].some((filter) =>
            jobPosition.includes(filter.toLowerCase())
          );
          if (!hasMatchingPosition) {
            return false;
          }
        }

        // Distance filter - filter jobs based on calculated distance
        if (filters.distance && filters.distance.length > 0) {
          const selectedDistance = Math.max(...filters.distance);

          // "Any Distance" (value 0) means no distance filtering
          if (selectedDistance === 0) {
            return true;
          }

          if (!job.distance) {
            return true; // Don't filter out jobs without distance
          }

          // Special handling for "100km+" (value 101)
          if (selectedDistance === 101) {
            // "100km+" means show jobs MORE than 100km away
            if (job.distance <= 100) {
              return false;
            }
          } else {
            // Regular distance filters (show jobs LESS than or equal to selected distance)
            if (job.distance > selectedDistance) {
              return false;
            }
          }
        }

        // City filter - check if job city matches selected cities
        if (filters.city && filters.city.length > 0) {
          const jobCity = job.location?.city?.toLowerCase() || "";
          const hasMatchingCity = filters.city.some((filter) =>
            jobCity.includes(filter.toLowerCase())
          );
          if (!hasMatchingCity) {
            return false;
          }
        }

        return true;
      });

      // Apply sorting based on selected method
      if (sortMethod === "closest") {
        // Sort by distance (closest first), jobs without distance go to end
        jobs.sort((a, b) => {
          if (!a.distance && !b.distance) return 0;
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return a.distance - b.distance;
        });
      } else if (sortMethod === "newest") {
        // Sort by creation date (newest first)
        jobs.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
      } else if (sortMethod === "highest-paying") {
        // Sort by pay rate (highest first)
        jobs.sort((a, b) => {
          const payA = parseFloat(a.payRate) || 0;
          const payB = parseFloat(b.payRate) || 0;
          return payB - payA;
        });
      }

      return jobs;
    }, [publicJobs, coords, filters, sortMethod]);

    // Update loading state when jobs data becomes available
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

    // Distance filter debug info available in development mode
    // Removed console logs for production

    if (isLoading) {
      return (
        <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
          <Loader size="2xl" text="Loading jobs..." />
        </div>
      );
    } else if (showNoJobs || (publicJobs && publicJobs.length === 0)) {
      // No jobs available state
      return (
        <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh] animate-[fadeIn_0.6s_ease-in-out]">
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
        // No jobs match the current filters
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

      // Render the filtered and sorted job list
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

    // Fallback case for unexpected states
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

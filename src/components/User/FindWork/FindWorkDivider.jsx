import FindWorkJob from "./FindWorkJob";
import { NavLink } from "react-router-dom";
import { useJob } from "../../../contexts/JobContext";
import { LocationContext } from "../../../contexts/LocationContext";
import Loader from "../../UI/Loader";
import { useState, useEffect, useContext } from "react";
import getDistance from "../../../utils/getDistance";

const FindWorkDivider = ({ sortMethod = "newest", filters = {} }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showNoJobs, setShowNoJobs] = useState(false);
  const { publicJobs } = useJob();
  const { coords } = useContext(LocationContext);

  // Sort and filter jobs based on the selected method and filters
  const getSortedJobs = () => {
    if (!publicJobs || publicJobs.length === 0) return [];

    let sortedJobs = [...publicJobs];

    // Calculate distances for all jobs if we have user location
    if (coords.lat && coords.lng) {
      sortedJobs.forEach((job) => {
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
    sortedJobs = sortedJobs.filter((job) => {
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
          if (!job.distance) return false;

          if (selectedDistance === 101) {
            // 100km+ filter
            if (job.distance < 100) return false;
          } else {
            // Specific distance range
            if (job.distance > selectedDistance) return false;
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
        sortedJobs.sort((a, b) => {
          if (!a.distance && !b.distance) return 0;
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return a.distance - b.distance;
        });
        break;

      case "highest-paying":
        sortedJobs.sort((a, b) => {
          const payA = parseFloat(a.payRate) || 0;
          const payB = parseFloat(b.payRate) || 0;
          return payB - payA; // Highest first
        });
        break;

      case "newest":
        sortedJobs.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA; // Newest first
        });
        break;

      case "least-applied":
        sortedJobs.sort((a, b) => {
          const applicantsA = a.applicants || 0;
          const applicantsB = b.applicants || 0;
          return applicantsA - applicantsB; // Least applied first
        });
        break;

      default:
        break;
    }

    return sortedJobs;
  };

  useEffect(() => {
    // When we get data from Firebase, check immediately
    if (publicJobs && isLoading) {
      // If jobs exist, show them immediately
      if (publicJobs.length > 0) {
        setIsLoading(false);
      } else {
        // If no jobs, wait 5 seconds before showing "no jobs"
        setTimeout(() => {
          setIsLoading(false);
          setShowNoJobs(true);
        }, 5000);
      }
    }
  }, [publicJobs]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <Loader size="2xl" text="Loading jobs..." />
      </div>
    );
  } else if (publicJobs && publicJobs.length === 0 && showNoJobs) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">No jobs found.</div>
      </div>
    );
  } else if (publicJobs && publicJobs.length > 0) {
    const sortedJobs = getSortedJobs();
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
};

export default FindWorkDivider;

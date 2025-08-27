import React, { useState } from "react";
import Breadcrumb from "../../../components/UI/Breadcrumb";
import FindWorkDivider from "../../../components/User/FindWork/FindWorkDivider";
import FindWorkHeading from "../../../components/User/FindWork/FindWorkHeading";
import SortBar from "../../../components/User/FindWork/SortBar";
import Loader from "../../../components/UI/Loader";
import { JobProvider, useJob } from "../../../contexts/JobContext";
import { LocationProvider } from "../../../contexts/LocationContext";

// Main content component for the FindWork page
// Manages job data, sorting, filtering, and loading states
const FindWorkContent = () => {
  // Access job data and loading state from context
  const { publicJobs, loading } = useJob();

  // Sort method state for job ordering (closest, newest, etc.)
  const [sortMethod, setSortMethod] = useState("closest");
  
  // Filter state for job position, distance, and city filtering
  const [filters, setFilters] = useState({
    "job-position": [],
    distance: [],
    city: [],
  });

  // Job data loaded from context

  // TODO: Add error and loading states
  
  // Breadcrumb navigation configuration
  const pages = [{ name: "Find Work", href: "#", current: true }];
  
  return (
    <div className="flex flex-col m-10 gap-4 ">
      {/* Navigation breadcrumb */}
      <Breadcrumb pages={pages} />
      
      {/* Page heading and description */}
      <FindWorkHeading />
      
      {/* Sorting and filtering controls */}
      <SortBar onSortChange={setSortMethod} onFilterChange={setFilters} />
      
      {/* Conditional rendering based on loading state */}
      {loading ? (
        <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
          <Loader size="2xl" text="Loading jobs..." />
        </div>
      ) : (
        /* Job listings with applied sorting and filtering */
        <FindWorkDivider sortMethod={sortMethod} filters={filters} />
      )}
    </div>
  );
};

// Main FindWork page component with context providers
// Wraps content with LocationProvider and JobProvider for data access
const FindWork = () => {
  return (
    <LocationProvider>
      <JobProvider>
        <FindWorkContent />
      </JobProvider>
    </LocationProvider>
  );
};

export default FindWork;

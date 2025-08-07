import React, { useState } from "react";
import Breadcrumb from "../../../components/UI/Breadcrumb";
import FindWorkDivider from "../../../components/User/FindWork/FindWorkDivider";
import FindWorkHeading from "../../../components/User/FindWork/FindWorkHeading";
import SortBar from "../../../components/User/FindWork/SortBar";
import Loader from "../../../components/UI/Loader";
import { useJob } from "../../../contexts/JobContext";

const FindWork = () => {
  const { publicJobs, loading } = useJob();

  const [sortMethod, setSortMethod] = useState("closest");
  const [filters, setFilters] = useState({
    "job-position": [],
    distance: [],
    city: [],
  });

  // TODO: Add error and loading states

  const pages = [{ name: "Find Work", href: "#", current: true }];
  return (
    <div className="flex flex-col m-10 gap-4 ">
      <Breadcrumb pages={pages} />
      <FindWorkHeading />
      <SortBar onSortChange={setSortMethod} onFilterChange={setFilters} />
      {loading ? (
        <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
          <Loader size="2xl" text="Loading jobs..." />
        </div>
      ) : (
        <FindWorkDivider sortMethod={sortMethod} filters={filters} />
      )}
    </div>
  );
};

export default FindWork;

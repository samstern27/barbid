import React, { useContext, useState } from "react";
import Breadcrumb from "../../../components/UI/Breadcrumb";
import FindWorkDivider from "../../../components/User/FindWork/FindWorkDivider";
import FindWorkHeading from "../../../components/User/FindWork/FindWorkHeading";
import { LocationContext } from "../../../contexts/LocationContext";
import SortBar from "../../../components/User/FindWork/SortBar";

const FindWork = () => {
  const { coords, error, loading } = useContext(LocationContext);
  const [sortMethod, setSortMethod] = useState("newest");
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
      <FindWorkDivider sortMethod={sortMethod} filters={filters} />
    </div>
  );
};

export default FindWork;

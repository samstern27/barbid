import { NavLink, useParams } from "react-router-dom";
import { useBusiness } from "../../../contexts/BusinessContext";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

export default function MyBusinessJobListingsApplicantsDetail() {
  const { applicantUsername, jobId } = useParams();
  const { selectedBusiness } = useBusiness();

  return (
    <div>
      <NavLink
        to={`/my-business/${selectedBusiness.id}/job-listings/${jobId}/applicants`}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Applicants
      </NavLink>
    </div>
  );
}

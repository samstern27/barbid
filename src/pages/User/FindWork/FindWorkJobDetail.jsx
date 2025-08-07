import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { useNavigate, NavLink, useParams } from "react-router-dom";
import Breadcrumb from "../../../components/UI/Breadcrumb";
import { useJob } from "../../../contexts/JobContext";

const pages = [
  { name: "Find Work", href: "/find-work", current: false },
  { name: "Job Details", href: "#", current: true },
];

export default function FindWorkJobDetail() {
  const navigate = useNavigate();
  const { publicJobs } = useJob();
  const { jobId } = useParams();
  const job = publicJobs.find((job) => job.id === jobId);

  if (!job) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Job not found or has been deleted.</p>
          <button
            onClick={() => navigate("/find-work")}
            className="mt-2 text-indigo-600 hover:text-indigo-500"
          >
            Back to Find Work
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col m-10 gap-4 ">
      <Breadcrumb pages={pages} />
      <div className="animate-[fadeIn_1.2s_ease-in-out]">
        <NavLink
          to="/find-work"
          className="inline-flex items-center gap-2 text-sm mb-6 font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Find Work
        </NavLink>
        <div className="">
          <h3 className="text-base/7 font-semibold text-gray-900">
            Job Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">
            View job details and requirements.
          </p>
        </div>
        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">Job Title</dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                <span className="grow">{job.jobTitle}</span>
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">
                Description
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                <span className="grow">{job.description}</span>
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">Pay Rate</dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                <span className="grow">£{job.payRate}/hr</span>
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">
                Start Time
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                <span className="grow">
                  {new Date(job.startOfShift).toLocaleString()}
                </span>
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">End Time</dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                <span className="grow">
                  {new Date(job.endOfShift).toLocaleString()}
                </span>
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">Status</dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                <span className="grow">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                      job.status === "Open"
                        ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                        : "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20"
                    }`}
                  >
                    {job.status}
                  </span>
                </span>
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900">Created</dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                <span className="grow">
                  {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

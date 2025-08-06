import { useParams, NavLink } from "react-router-dom";
import { useBusiness } from "../../../contexts/BusinessContext";
import { ArrowLeftIcon, EyeIcon } from "@heroicons/react/20/solid";

export default function MyBusinessJobListingsApplicants() {
  const { jobId } = useParams();
  const { selectedBusiness } = useBusiness();
  const job = selectedBusiness?.jobs?.[jobId];

  const people = [
    {
      initials: "S.S.",
      occupation: "Bar Manager",
      rating: "5 Star",
      username: "sstern25",
      payRate: "£10.00",
      applied: "12/08/2025",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  ];

  return (
    <div>
      <NavLink
        to={`/my-business/${selectedBusiness.id}/job-listings/${jobId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Job Details
      </NavLink>
      <div className="mt-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-gray-900">
              Applicants for {job.jobTitle}
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all the applicants for {job.jobTitle}.
            </p>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="relative min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Username
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Occupation
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Rate
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Applied
                    </th>
                    <th scope="col" className="py-3.5 pr-4 pl-3 sm:pr-0">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {people.map((person, index) => (
                    <tr key={index}>
                      <td className="py-5 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-0">
                        <div className="flex items-center">
                          <div className="size-11 shrink-0">
                            <img
                              alt=""
                              src={person.image}
                              className="size-11 rounded-full"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">
                              @{person.username}
                            </div>
                            <div className="mt-1 text-gray-500">
                              {person.initials}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
                        <div className="text-gray-900">{person.occupation}</div>
                        <div className="mt-1 text-gray-500">
                          {person.rating}
                        </div>
                      </td>
                      <td className="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
                        {person.payRate}
                      </td>
                      <td className="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
                        {person.applied}
                      </td>
                      <td className="py-5 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
                        <NavLink
                          to={`/my-business/${selectedBusiness.id}/job-listings/${jobId}/applicants/${person.username}`}
                          className="text-red-500 hover:text-red-600 flex items-center gap-2"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View
                          <span className="sr-only">, {person.initials}</span>
                        </NavLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

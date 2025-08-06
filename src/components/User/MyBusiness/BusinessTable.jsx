import { useNavigate } from "react-router-dom";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function BusinessTable({ businesses }) {
  const navigate = useNavigate();

  // Handle the data structure - businesses should be an object with business IDs as keys
  const businessList =
    businesses && typeof businesses === "object" && !Array.isArray(businesses)
      ? Object.entries(businesses)
          .map(([id, business]) => ({ ...business, id }))
          .filter((business) => business && business.name)
      : [];

  return (
    <div className="w-full animate-[fadeIn_1.2s_ease-in-out]">
      <div className="mt-10 ring-1 ring-gray-300 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 ">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Name
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
              >
                Phone
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
              >
                Type
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
              >
                Job Listings
              </th>

              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Privacy
              </th>
              <th scope="col" className="relative py-3.5 pr-4 pl-3 sm:pr-6">
                <span className="sr-only">Select</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {businessList.map((business, businessIdx) => (
              <tr key={business.id || business.businessId || businessIdx}>
                <td
                  className={classNames(
                    businessIdx === 0 ? "" : "border-t border-transparent",
                    "relative py-4 pr-3 pl-4 text-sm sm:pl-6"
                  )}
                >
                  <div className="font-medium text-gray-900">
                    {business.name}
                    {business.isCurrent ? (
                      <span className="ml-1 text-indigo-600">
                        (Current Plan)
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-col text-gray-500 sm:block lg:hidden">
                    <span>
                      {business.phone} / {business.type}
                    </span>
                    <span className="hidden sm:inline"> · </span>
                    <span
                      className={
                        business.privacy === "public"
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {business.privacy}
                    </span>
                  </div>
                  {businessIdx !== 0 ? (
                    <div className="absolute -top-px right-0 left-6 h-px bg-gray-200" />
                  ) : null}
                </td>
                <td
                  className={classNames(
                    businessIdx === 0 ? "" : "border-t border-gray-200",
                    "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell"
                  )}
                >
                  {business.phone}
                </td>
                <td
                  className={classNames(
                    businessIdx === 0 ? "" : "border-t border-gray-200",
                    "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell"
                  )}
                >
                  {business.type}
                </td>
                <td
                  className={classNames(
                    businessIdx === 0 ? "" : "border-t border-gray-200",
                    "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell"
                  )}
                >
                  {business.jobListings}
                </td>
                <td
                  className={classNames(
                    businessIdx === 0 ? "" : "border-t border-gray-200",
                    "px-3 py-3.5 text-sm text-gray-500"
                  )}
                >
                  <div
                    className={`sm:hidden ${
                      business.privacy === "public"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {business.privacy}
                  </div>
                  <div
                    className={`hidden sm:block ${
                      business.privacy === "public"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {business.privacy}
                  </div>
                </td>
                <td
                  className={classNames(
                    businessIdx === 0 ? "" : "border-t border-transparent",
                    "relative py-3.5 pr-4 pl-3 text-right text-sm font-medium sm:pr-6"
                  )}
                >
                  <button
                    type="button"
                    disabled={business.isCurrent}
                    className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                    onClick={() =>
                      navigate(`/my-business/${business.businessId}`)
                    }
                  >
                    View<span className="sr-only">, {business.name}</span>
                  </button>
                  {businessIdx !== 0 ? (
                    <div className="absolute -top-px right-6 left-0 h-px bg-gray-200" />
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

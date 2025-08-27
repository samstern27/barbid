import { PlusIcon } from "@heroicons/react/20/solid";

// Empty state component for when user has no businesses
// Features a custom briefcase SVG icon and call-to-action button
export default function EmptyState({
  createBusinessOpen,
  setCreateBusinessOpen,
}) {
  return (
    <div className="text-center">
      {/* Custom briefcase SVG icon with plus symbol */}
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="mx-auto size-12 text-gray-400"
      >
        {/* Briefcase body */}
        <rect
          x="3"
          y="7"
          width="18"
          height="13"
          rx="2"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Briefcase handle */}
        <path
          d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Plus icon in the middle */}
        <line
          x1="12"
          y1="12"
          x2="12"
          y2="16"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
        <line
          x1="10"
          y1="14"
          x2="14"
          y2="14"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      </svg>

      {/* Empty state text */}
      <h3 className="mt-2 text-sm font-semibold text-gray-900">
        No businesses
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Get started by creating a new business.
      </p>

      {/* Call-to-action button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setCreateBusinessOpen(true)}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon aria-hidden="true" className="mr-1.5 -ml-0.5 size-5" />
          New Business
        </button>
      </div>
    </div>
  );
}

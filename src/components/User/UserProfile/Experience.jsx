import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";

// Use profile data instead of hardcoded data

// Utility function to conditionally join CSS classes
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Experience component for user profile displaying work history
// Shows experience entries with role, dates, and position information
export default function Experience({ profile }) {
  return (
    <div className="rounded-lg m-4 sm:m-6 lg:m-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-0">
      {/* Section header */}
      <div className="border-b border-gray-200 pb-4 sm:pb-5">
        <h3 className="text-base font-semibold text-white">Experience</h3>
      </div>

      {/* Conditional rendering based on experience data availability */}
      {profile.experience && profile.experience.length > 0 ? (
        <ul role="list" className="divide-y divide-gray-100">
          {profile.experience.map((exp) => (
            <li
              key={exp.id}
              className="flex items-center justify-between gap-x-4 sm:gap-x-6 py-3 sm:py-4"
            >
              <div className="min-w-0">
                {/* Experience name and role */}
                <div className="flex items-start gap-x-2 sm:gap-x-3">
                  <p className="text-sm/6 font-semibold text-white">
                    {exp.name}
                  </p>
                  {/* Role badge with ring styling */}
                  <p
                    className={classNames(
                      "text-white bg-transparent ring-white/20",
                      "mt-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset"
                    )}
                  >
                    {exp.role}
                  </p>
                </div>

                {/* Date range and position with separator dot */}
                <div className="mt-1 flex items-center gap-x-2 text-xs/5 text-white">
                  <p className="whitespace-nowrap">
                    {exp.startDate} - {exp.endDate}
                  </p>
                  {/* Small separator dot */}
                  <svg viewBox="0 0 2 2" className="size-0.5 fill-current">
                    <circle r={1} cx={1} cy={1} />
                  </svg>
                  <p className="truncate">{exp.position}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        /* Empty state when no experience is available */
        <div className="py-8 text-center">
          <p className="text-sm text-gray-400">No work experience added yet.</p>
        </div>
      )}
    </div>
  );
}

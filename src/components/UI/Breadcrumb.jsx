import { memo } from "react";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid";
import { NavLink } from "react-router-dom";

// Breadcrumb component for navigation hierarchy
// Uses React.memo for performance optimization since breadcrumbs rarely change
const Breadcrumb = memo(({ pages }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex mb-4">
      <ol role="list" className="flex items-center space-x-4">
        {/* Home icon - always present as the root */}
        <li>
          <div>
            <NavLink to="/" className="text-gray-400 hover:text-gray-500">
              <HomeIcon aria-hidden="true" className="size-5 shrink-0" />
              <span className="sr-only">Home</span>
            </NavLink>
          </div>
        </li>

        {/* Dynamic breadcrumb pages with chevron separators */}
        {pages &&
          pages.map((page, index) => (
            <li key={index} className="animate-[fadeInRight_0.3s_ease-in-out]">
              <div className="flex items-center">
                {/* Chevron separator between breadcrumb items */}
                <ChevronRightIcon
                  aria-hidden="true"
                  className="size-5 shrink-0 text-gray-400"
                />
                <NavLink
                  to={page.href}
                  aria-current={page.current ? "page" : undefined}
                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  {page.name}
                </NavLink>
              </div>
            </li>
          ))}
      </ol>
    </nav>
  );
});

export default Breadcrumb;

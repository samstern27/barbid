import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useJob } from "../../../contexts/JobContext";

const sortOptions = [
  { name: "Closest", value: "closest" },
  { name: "Newest", value: "newest" },
  { name: "Highest Paying", value: "highest-paying" },
  { name: "Least Applied", value: "least-applied" },
];

const SortBar = React.memo(({ children, onSortChange, onFilterChange }) => {
  const { publicJobs } = useJob();
  const [open, setOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("closest");
  const [selectedFilters, setSelectedFilters] = useState({
    "job-position": [],
    distance: [],
    city: [],
  });

  // Memoize cities calculation to avoid recalculating on every render
  const cities = useMemo(() => {
    const citiesArray = publicJobs.map((job) =>
      job.location.city.toLowerCase()
    );
    return [...new Set(citiesArray)];
  }, [publicJobs]);

  // Memoize filters array to avoid recreating on every render
  const filters = useMemo(
    () => [
      {
        id: "job-position",
        name: "Job position",
        options: [
          { value: "Barista", label: "Barista" },
          { value: "Bar Back", label: "Bar Back" },
          { value: "Bar Manager", label: "Bar Manager" },
          { value: "Bar Supervisor", label: "Bar Supervisor" },
          { value: "Bartender", label: "Bartender" },
          { value: "Busser", label: "Busser" },
          { value: "Cafe Host", label: "Cafe Host" },
          { value: "Cafe Manager", label: "Cafe Manager" },
          { value: "Cafe Server", label: "Cafe Server" },
          { value: "Cafe Supervisor", label: "Cafe Supervisor" },
          { value: "Club Host", label: "Club Host" },
          { value: "Club Manager", label: "Club Manager" },
          { value: "Club Server", label: "Club Server" },
          { value: "Club Supervisor", label: "Club Supervisor" },
          { value: "Floor Manager", label: "Floor Manager" },
          { value: "Food Runner", label: "Food Runner" },
          { value: "Host/Hostess", label: "Host/Hostess" },
          { value: "Restaurant Host", label: "Restaurant Host" },
          { value: "Restaurant Manager", label: "Restaurant Manager" },
          { value: "Restaurant Supervisor", label: "Restaurant Supervisor" },
          { value: "Server", label: "Server" },
          { value: "VIP Host", label: "VIP Host" },
          { value: "VIP Manager", label: "VIP Manager" },
          { value: "VIP Server", label: "VIP Server" },
          { value: "Waiter/Waitress", label: "Waiter/Waitress" },
          { value: "Other", label: "Other" },
        ],
      },
      {
        id: "distance",
        name: "Distance",
        options: [
          { value: 0, label: "Any Distance" },
          { value: 1, label: "Less than 1km" },
          { value: 5, label: "Less than 5km" },
          { value: 10, label: "Less than 10km" },
          { value: 20, label: "Less than 20km" },
          { value: 50, label: "Less than 50km" },
          { value: 100, label: "Less than 100km" },
          { value: 101, label: "100km+" },
        ],
      },
      {
        id: "city",
        name: "City/Town",
        options: cities.map((city) => ({
          value: city,
          label: city.charAt(0).toUpperCase() + city.slice(1), // Capitalize first letter
        })),
      },
    ],
    [cities]
  );

  const handleFilterChange = (filterId, value, checked) => {
    setSelectedFilters((prev) => {
      let newFilters;

      if (filterId === "distance") {
        // For distance, allow unselecting by clicking the same option again
        const currentDistance = prev[filterId] || [];
        if (currentDistance.includes(value)) {
          // If clicking the same option, unselect it
          newFilters = {
            ...prev,
            [filterId]: [],
          };
        } else {
          // If clicking a different option, select it
          newFilters = {
            ...prev,
            [filterId]: [value],
          };
        }
      } else {
        // For other filters, use checkbox behavior (multiple selection)
        const currentFilters = prev[filterId] || [];
        if (checked) {
          newFilters = {
            ...prev,
            [filterId]: [...currentFilters, value],
          };
        } else {
          newFilters = {
            ...prev,
            [filterId]: currentFilters.filter((item) => item !== value),
          };
        }
      }

      // Pass updated filters to parent component
      if (onFilterChange) {
        onFilterChange(newFilters);
      }

      return newFilters;
    });
  };

  return (
    <div className="bg-white animate-[fadeIn_1.2s_ease-in-out]">
      {/* Mobile filter dialog */}
      <Dialog open={open} onClose={setOpen} className="relative z-40 sm:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />

        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white pt-4 pb-6 shadow-xl transition duration-300 ease-in-out data-closed:translate-x-full"
          >
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="relative -mr-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            {/* Filters */}
            <form className="mt-4">
              {filters.map((section) => (
                <Disclosure
                  key={section.name}
                  as="div"
                  className="border-t border-gray-200 px-4 py-6"
                >
                  <h3 className="-mx-2 -my-3 flow-root">
                    <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400">
                      <span className="font-medium text-gray-900">
                        {section.name}
                      </span>
                      <span className="ml-6 flex items-center">
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="size-5 rotate-0 transform group-data-open:-rotate-180"
                        />
                      </span>
                    </DisclosureButton>
                  </h3>
                  <DisclosurePanel className="pt-6">
                    <div
                      className={`space-y-6 ${
                        section.id === "job-position"
                          ? "max-h-64 overflow-y-auto"
                          : ""
                      }`}
                    >
                      {section.options.map((option, optionIdx) => (
                        <div key={option.value} className="flex gap-3">
                          <div className="flex h-5 shrink-0 items-center">
                            <div className="group grid size-4 grid-cols-1">
                              <input
                                checked={
                                  selectedFilters[section.id]?.includes(
                                    option.value
                                  ) || false
                                }
                                onChange={(e) =>
                                  handleFilterChange(
                                    section.id,
                                    option.value,
                                    e.target.checked
                                  )
                                }
                                id={`filter-mobile-${section.id}-${optionIdx}`}
                                name={`${section.id}${
                                  section.id === "distance" ? "" : "[]"
                                }`}
                                type={
                                  section.id === "distance"
                                    ? "radio"
                                    : "checkbox"
                                }
                                className={`col-start-1 row-start-1 appearance-none border border-gray-300 bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto ${
                                  section.id === "distance"
                                    ? "rounded-full checked:border-indigo-600 checked:bg-indigo-600"
                                    : "rounded-sm checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600"
                                }`}
                              />
                              <svg
                                fill="none"
                                viewBox="0 0 14 14"
                                className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                              >
                                <path
                                  d="M3 8L6 11L11 3.5"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="opacity-0 group-has-checked:opacity-100"
                                />
                                <path
                                  d="M3 7H11"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="opacity-0 group-has-indeterminate:opacity-100"
                                />
                              </svg>
                            </div>
                          </div>
                          <label
                            htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                            className="text-sm text-gray-500"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </DisclosurePanel>
                </Disclosure>
              ))}

              {/* Mobile Clear All Filters Button */}
              {Object.values(selectedFilters).some(
                (filters) => filters.length > 0
              ) && (
                <div className="border-t border-gray-200 px-4 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      const clearedFilters = {
                        "job-position": [],
                        distance: [],
                        city: [],
                      };
                      setSelectedFilters(clearedFilters);
                      if (onFilterChange) {
                        onFilterChange(clearedFilters);
                      }
                    }}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      <section aria-labelledby="filter-heading" className="py-6 relative">
        <h2 id="filter-heading" className="sr-only">
          Product filters
        </h2>

        <div className="flex items-center justify-between">
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
              Sort
              <ChevronDownIcon
                aria-hidden="true"
                className="-mr-1 ml-1 size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
              />
            </MenuButton>

            <MenuItems
              transition
              className="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
              <div className="py-1">
                {sortOptions.map((option) => (
                  <MenuItem key={option.value}>
                    <button
                      onClick={() => {
                        setSelectedSort(option.value);
                        if (onSortChange) {
                          onSortChange(option.value);
                        }
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm font-medium data-focus:bg-gray-100 data-focus:outline-hidden ${
                        selectedSort === option.value
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-900"
                      }`}
                    >
                      {option.name}
                    </button>
                  </MenuItem>
                ))}
              </div>
            </MenuItems>
          </Menu>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-block text-sm font-medium text-gray-700 hover:text-gray-900 sm:hidden"
          >
            Filters
          </button>

          <div className="hidden sm:flex sm:items-baseline sm:space-x-8 relative">
            {/* Clear All Filters Button - Desktop */}
            {Object.values(selectedFilters).some(
              (filters) => filters.length > 0
            ) && (
              <button
                type="button"
                onClick={() => {
                  const clearedFilters = {
                    "job-position": [],
                    distance: [],
                    city: [],
                  };
                  setSelectedFilters(clearedFilters);
                  if (onFilterChange) {
                    onFilterChange(clearedFilters);
                  }
                }}
                className="px-0.5 py-0 text-xs font-medium text-red-600 bg-white rounded hover:text-red-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                Clear
              </button>
            )}
            <PopoverGroup className="flex items-baseline space-x-8">
              {filters.map((section, sectionIdx) => (
                <Popover
                  key={section.name}
                  className="relative inline-block text-left"
                >
                  <div>
                    <PopoverButton className="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                      <span>{section.name}</span>
                      {section.id !== "distance" &&
                      selectedFilters[section.id]?.length > 0 ? (
                        <span className="ml-1.5 rounded-sm bg-gray-200 px-1.5 py-0.5 text-xs font-semibold text-gray-700 tabular-nums">
                          {selectedFilters[section.id].length}
                        </span>
                      ) : null}
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="-mr-1 ml-1 size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
                      />
                    </PopoverButton>
                  </div>

                  <PopoverPanel
                    transition
                    className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                  >
                    <form
                      className={`space-y-4 ${
                        section.id === "job-position"
                          ? "max-h-64 overflow-y-auto"
                          : ""
                      }`}
                    >
                      {section.options.map((option, optionIdx) => (
                        <div key={option.value} className="flex gap-3">
                          <div className="flex h-5 shrink-0 items-center">
                            <div className="group grid size-4 grid-cols-1">
                              <input
                                checked={
                                  selectedFilters[section.id]?.includes(
                                    option.value
                                  ) || false
                                }
                                onChange={(e) =>
                                  handleFilterChange(
                                    section.id,
                                    option.value,
                                    e.target.checked
                                  )
                                }
                                id={`filter-${section.id}-${optionIdx}`}
                                name={`${section.id}${
                                  section.id === "distance" ? "" : "[]"
                                }`}
                                type={
                                  section.id === "distance"
                                    ? "radio"
                                    : "checkbox"
                                }
                                className={`col-start-1 row-start-1 appearance-none border border-gray-300 bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto ${
                                  section.id === "distance"
                                    ? "rounded-full checked:border-indigo-600 checked:bg-indigo-600"
                                    : "rounded-sm checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600"
                                }`}
                              />
                              <svg
                                fill="none"
                                viewBox="0 0 14 14"
                                className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                              >
                                <path
                                  d="M3 8L6 11L11 3.5"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="opacity-0 group-has-checked:opacity-100"
                                />
                                <path
                                  d="M3 7H11"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="opacity-0 group-has-indeterminate:opacity-100"
                                />
                              </svg>
                            </div>
                          </div>
                          <label
                            htmlFor={`filter-${section.id}-${optionIdx}`}
                            className="pr-6 text-sm font-medium whitespace-nowrap text-gray-900"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </form>
                  </PopoverPanel>
                </Popover>
              ))}
            </PopoverGroup>
          </div>
        </div>
      </section>
    </div>
  );
});

export default SortBar;

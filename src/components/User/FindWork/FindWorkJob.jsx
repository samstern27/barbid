import React from "react";
import {
  CalendarIcon,
  CurrencyPoundIcon,
  ClockIcon,
  MapPinIcon,
  EyeIcon,
} from "@heroicons/react/20/solid";
import { Menu, MenuButton } from "@headlessui/react";
import getDistance from "../../../utils/getDistance";
import { LocationContext } from "../../../contexts/LocationContext";
import { useContext, useMemo } from "react";

// Job display component for the Find Work section
// Shows job details with distance calculation and responsive actions
const FindWorkJob = React.memo(({ job }) => {
  // Get user's current coordinates from location context
  const { coords } = useContext(LocationContext);
  
  // Calculate distance from user to job location using useMemo for performance
  // Only recalculates when coordinates or job location changes
  const distance = useMemo(() => {
    // Only calculate distance if we have valid user coordinates
    if (!coords.lat || !coords.lng) return null;

    return getDistance(
      job.location.lat,
      job.location.lng,
      coords.lat,
      coords.lng
    );
  }, [job.location.lat, job.location.lng, coords.lat, coords.lng]);
  
  return (
    <div className="lg:flex lg:items-center lg:justify-between ">
      {/* Main job information section */}
      <div className="min-w-0 flex-1 flex-row">
        {/* Job title with business name and role */}
        <h2 className="text-xl font-bold text-gray-900 sm:truncate sm:text-2xl sm:tracking-tight">
          {job.businessName} -{" "}
          <span className="text-md font-normal text-indigo-600">
            {job.jobTitle}
          </span>
        </h2>

        {/* Job details grid with icons */}
        <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
          {/* Date - shows just the date part of the timestamp */}
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <CalendarIcon
              aria-hidden="true"
              className="mr-1.5 size-5 shrink-0 text-gray-400"
            />
            {job.startOfShift.split("T")[0]}
          </div>
          
          {/* Time range - shows start and end times */}
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <ClockIcon
              aria-hidden="true"
              className="mr-1.5 size-5 shrink-0 text-gray-400"
            />
            {job.startOfShift.split("T")[1]} - {job.endOfShift.split("T")[1]}
          </div>
          
          {/* Pay rate */}
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <CurrencyPoundIcon
              aria-hidden="true"
              className="mr-1.5 size-5 shrink-0 text-gray-400"
            />
            £{job.payRate}/h
          </div>
          
          {/* Full address */}
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <MapPinIcon
              aria-hidden="true"
              className="mr-1.5 size-5 shrink-0 text-gray-400"
            />
            {job.location.address}, {job.location.postcode}, {job.location.city}
          </div>
          
          {/* Calculated distance - only shown if available */}
          {distance !== null && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <MapPinIcon
                aria-hidden="true"
                className="mr-1.5 size-5 shrink-0 text-gray-400"
              />
              {distance.toFixed(1)} km
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons section - responsive design */}
      <div className="mt-5 flex lg:mt-0 lg:ml-4">
        {/* Desktop view button - hidden on small screens */}
        <span className="ml-3 hidden sm:block">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50"
          >
            <EyeIcon
              aria-hidden="true"
              className="mr-1.5 -ml-0.5 size-5 text-gray-400"
            />
            View Job
          </button>
        </span>

        {/* Mobile dropdown menu - only visible on small screens */}
        <Menu as="div" className="relative ml-3 sm:hidden">
          <MenuButton className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50">
            <EyeIcon
              aria-hidden="true"
              className="mr-1.5 -ml-0.5 size-5 text-gray-400"
            />
            View Job
          </MenuButton>
        </Menu>
      </div>
    </div>
  );
});

export default FindWorkJob;

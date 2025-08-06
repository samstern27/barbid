import {
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  CurrencyPoundIcon,
  ClockIcon,
  LinkIcon,
  MapPinIcon,
  PencilIcon,
  EyeIcon,
} from "@heroicons/react/20/solid";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { getDatabase, ref } from "firebase/database";
import { getDistance } from "../../../utils/getDistance.js";
import { LocationContext } from "../../../contexts/LocationContext";
import { useContext } from "react";

export default function FindWorkJob({ job }) {
  const { coords } = useContext(LocationContext);

  const distance = getDistance(
    job.location.lat,
    job.location.lng,
    coords.lat,
    coords.lng
  );
  return (
    <div className="lg:flex lg:items-center lg:justify-between ">
      <div className="min-w-0 flex-1 flex-row">
        <h2 className="text-xl font-bold text-gray-900 sm:truncate sm:text-2xl sm:tracking-tight">
          {job.businessName} -{" "}
          <span className="text-md font-normal text-red-500">
            {job.jobTitle}
          </span>
        </h2>

        <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <CalendarIcon
              aria-hidden="true"
              className="mr-1.5 size-5 shrink-0 text-gray-400"
            />
            {job.startOfShift.split("T")[0]}
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <ClockIcon
              aria-hidden="true"
              className="mr-1.5 size-5 shrink-0 text-gray-400"
            />
            {job.startOfShift.split("T")[1]} - {job.endOfShift.split("T")[1]}
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <CurrencyPoundIcon
              aria-hidden="true"
              className="mr-1.5 size-5 shrink-0 text-gray-400"
            />
            £{job.payRate}/h
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <MapPinIcon
              aria-hidden="true"
              className="mr-1.5 size-5 shrink-0 text-gray-400"
            />
            {job.location.address}, {job.location.postcode}, {job.location.city}
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <MapPinIcon
              aria-hidden="true"
              className="mr-1.5 size-5 shrink-0 text-gray-400"
            />
            {distance.toFixed(1)} km
          </div>
        </div>
      </div>
      <div className="mt-5 flex lg:mt-0 lg:ml-4">
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

        {/* Dropdown */}
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
}

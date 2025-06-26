import React from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
} from "@heroicons/react/20/solid";

const TopBar = ({ profile }) => {
  return (
    <>
      <div>
        <img
          alt=""
          src={profile.backgroundImage}
          className="h-32 w-full object-cover lg:h-48"
        />
      </div>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
          <div className="flex justify-center sm:justify-start">
            <img
              alt="Profile avatar"
              src={profile.avatar}
              className="size-24 rounded-full ring-4 bg-white ring-white sm:size-32 "
            />
          </div>
          <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div className="mt-6 min-w-0 flex-1 sm:block md:block flex flex-col items-center">
              <h2 className="truncate text-2xl font-bold text-gray-900">
                {profile.firstName ? profile.firstName[0] + "." : ""}
                {profile.lastName ? profile.lastName[0] + "." : ""}
              </h2>
              <h3 className="text-sm text-gray-500">
                @{profile.username ? profile.username : "No username"}
              </h3>
            </div>
            <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
              >
                <BriefcaseIcon
                  aria-hidden="true"
                  className="mr-1.5 -ml-0.5 size-5 text-gray-400"
                />
                <span>Hire Me</span>
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
              >
                <EnvelopeIcon
                  aria-hidden="true"
                  className="mr-1.5 -ml-0.5 size-5 text-gray-400"
                />
                <span>Call</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 mx-4 sm:mx-6 lg:mx-8 border-b border-gray-200 pb-5">
        <h3 className="text-2xl/7 font-bold text-gray-900 sm:text-3xl sm:tracking-tight">
          {profile.occupation ? profile.occupation : "No occupation"}
        </h3>
      </div>
    </>
  );
};

export default TopBar;

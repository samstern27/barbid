import React from "react";
import { BriefcaseIcon, StarIcon } from "@heroicons/react/20/solid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const TopBar = ({ profile }) => {
  const theme = profile.theme || "gray";
  const rating =
    profile.reviews?.length > 0
      ? profile.reviews.reduce((sum, review) => sum + review.rating, 0) /
        profile.reviews.length
      : 0;

  const themeClasses = {
    amber: ["bg-amber-600", "text-amber-500"],
    blue: ["bg-blue-600", "text-blue-500"],
    cyan: ["bg-cyan-600", "text-cyan-500"],
    emerald: ["bg-emerald-600", "text-emerald-500"],
    fuchsia: ["bg-fuchsia-600", "text-fuchsia-500"],
    gray: ["bg-gray-600", "text-gray-500"],
    green: ["bg-green-600", "text-green-500"],
    indigo: ["bg-indigo-600", "text-indigo-500"],
    lime: ["bg-lime-600", "text-lime-500"],
    neutral: ["bg-neutral-600", "text-neutral-500"],
    orange: ["bg-orange-600", "text-orange-500"],
    pink: ["bg-pink-600", "text-pink-500"],
    purple: ["bg-purple-600", "text-purple-500"],
    red: ["bg-red-600", "text-red-500"],
    rose: ["bg-rose-600", "text-rose-500"],
    sky: ["bg-sky-600", "text-sky-500"],
    slate: ["bg-slate-600", "text-slate-500"],
    stone: ["bg-stone-600", "text-stone-500"],
    teal: ["bg-teal-600", "text-teal-500"],
    violet: ["bg-violet-600", "text-violet-500"],
    yellow: ["bg-yellow-600", "text-yellow-500"],
    zinc: ["bg-zinc-600", "text-zinc-500"],
  };

  return (
    <div className={`bg-gradient-to-br ${themeClasses[theme][0]} to-gray-700 `}>
      <div className={`w-full `}>
        <div className="h-32 w-full object-cover lg:h-48">
          <img
            alt=""
            src={profile.backgroundImage}
            className="h-32 w-full object-cover lg:h-48 shadow-lg shadow-black/50"
          />
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
          <div className="flex justify-center sm:justify-start">
            <img
              alt="Profile avatar"
              src={profile.avatar}
              className="size-24 rounded-full ring-4 bg-white ring-white sm:size-32 shadow-2xl shadow-black"
            />
          </div>
          <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div className="mt-6 min-w-0 flex-1 sm:block md:block flex flex-col items-center">
              <h2
                className={`truncate text-2xl font-bold text-white text-shadow-md`}
              >
                {profile.firstName ? profile.firstName[0] + "." : ""}
                {profile.lastName ? profile.lastName[0] + "." : ""}
              </h2>
              <h3 className="text-sm text-gray-200 text-shadow-md">
                @{profile.username ? profile.username : "No username"}
              </h3>
            </div>
            <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-lg ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
              >
                <BriefcaseIcon
                  aria-hidden="true"
                  className={`mr-1.5 -ml-0.5 size-5 text-gray-600`}
                />
                <span>Hire Me</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 mx-0 max-w-5xl px-4 sm:px-6 lg:px-8 pb-5 flex flex-col gap-2">
        <h3
          className={`text-4xl font-light text-shadow-sm text-white sm:text-4xl sm:tracking-tight text-center  lg:text-left `}
        >
          {profile.occupation ? profile.occupation : "No occupation"}
        </h3>
        <div className="flex items-center gap-1 justify-center lg:justify-start">
          {[...Array(5)].map((_, index) => (
            <StarIcon
              key={index}
              aria-hidden="true"
              className={classNames(
                index < rating ? "text-yellow-400" : "text-gray-200",
                "size-5 shrink-0"
              )}
            />
          ))}
          <span className="text-gray-200 text-sm">
            ({profile.reviews?.length})
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

import About from "./About";
import Skills from "./Skills";
import Experience from "./Experience";
import Qualifications from "./Qualifications";

// BentoGrid component that creates a responsive grid layout for user profile sections
// Uses a 6-column grid system with different component sizes and rounded corners
export default function BentoGrid({ profile, className = "" }) {
  // Theme configuration for the bento grid background
  // Each theme provides 4 color values: [bg-dark, text-dark, bg-light, text-dark]
  const themeClasses = {
    amber: ["bg-amber-900", "text-amber-900", "bg-amber-200", "text-amber-900"],
    blue: ["bg-blue-900", "text-blue-900", "bg-blue-200", "text-blue-900"],
    cyan: ["bg-cyan-900", "text-cyan-900", "bg-cyan-200", "text-cyan-900"],
    emerald: [
      "bg-emerald-900",
      "text-emerald-900",
      "bg-emerald-200",
      "text-emerald-900",
    ],
    fuchsia: [
      "bg-fuchsia-900",
      "text-fuchsia-900",
      "bg-fuchsia-200",
      "text-fuchsia-900",
    ],
    gray: ["bg-gray-900", "text-gray-900", "bg-gray-300", "text-gray-900"],
    green: ["bg-green-900", "text-green-900", "bg-green-200", "text-green-900"],
    indigo: [
      "bg-indigo-900",
      "text-indigo-900",
      "bg-indigo-200",
      "text-indigo-900",
    ],
    lime: ["bg-lime-900", "text-lime-900", "bg-lime-200", "text-lime-900"],
    neutral: [
      "bg-neutral-900",
      "text-neutral-900",
      "bg-neutral-200",
      "text-neutral-900",
    ],
    orange: [
      "bg-orange-900",
      "text-orange-900",
      "bg-orange-200",
      "text-orange-900",
    ],
    pink: ["bg-pink-900", "text-pink-900", "bg-pink-200", "text-pink-900"],
    purple: [
      "bg-purple-900",
      "text-purple-900",
      "bg-purple-200",
      "text-purple-900",
    ],
    red: ["bg-red-900", "text-red-900", "bg-red-200", "text-red-900"],
    rose: ["bg-rose-900", "text-rose-900", "bg-rose-200", "text-rose-900"],
    sky: ["bg-sky-900", "text-sky-900", "bg-sky-200", "text-sky-900"],
    slate: ["bg-slate-900", "text-slate-900", "bg-slate-200", "text-slate-900"],
    stone: ["bg-stone-900", "text-stone-900", "bg-stone-200", "text-stone-900"],
    teal: ["bg-teal-900", "text-teal-900", "bg-teal-200", "text-teal-900"],
    violet: [
      "bg-violet-900",
      "text-violet-900",
      "bg-violet-200",
      "text-violet-900",
    ],
    yellow: [
      "bg-yellow-900",
      "text-yellow-900",
      "bg-yellow-200",
      "text-yellow-900",
    ],
    zinc: ["bg-zinc-900", "text-zinc-900", "bg-zinc-200", "text-zinc-900"],
  };

  return (
    <div
      className={`bg-gradient-to-b ${
        themeClasses[profile.theme][0]
      } to-gray-700 py-24 sm:py-32 relative ${className}`}
    >
      {/* Subtle pattern overlay for visual texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            135deg,
            transparent,
            transparent 4px,
            rgba(255, 255, 255, 0.5) 4px,
            rgba(255, 255, 255, 0.5) 5px
          )`,
        }}
      />

      {/* Main content container */}
      <div className="relative z-10">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          {/* Profile header with username and one-liner */}
          <h2 className="text-base/7 font-semibold text-white">
            {profile.username}
          </h2>
          <p className="mt-2 max-w-lg text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
            {profile.oneLine}
          </p>

          {/* Bento grid layout - 6 columns on large screens, 1 column on mobile */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
            {/* About section - spans 4 columns, top-left with rounded corners */}
            <div className="flex p-px lg:col-span-4">
              <div className="w-full overflow-hidden rounded-lg bg-gray-800 outline outline-white/15 max-lg:rounded-t-4xl lg:rounded-tl-4xl">
                <About profile={profile} />
              </div>
            </div>

            {/* Qualifications section - spans 2 columns, top-right with rounded corners */}
            <div className="flex p-px lg:col-span-2">
              <div className="w-full overflow-hidden rounded-lg bg-gray-800 outline outline-white/15 lg:rounded-tr-4xl">
                <Qualifications profile={profile} />
              </div>
            </div>

            {/* Skills section - spans 2 columns, bottom-left with rounded corners */}
            <div className="flex p-px lg:col-span-2">
              <div className="w-full overflow-hidden rounded-lg bg-gray-800 outline outline-white/15 lg:rounded-bl-4xl">
                <Skills profile={profile} />
              </div>
            </div>

            {/* Experience section - spans 4 columns, bottom-right with rounded corners */}
            <div className="flex p-px lg:col-span-4">
              <div className="w-full overflow-hidden rounded-lg bg-gray-800 outline outline-white/15 max-lg:rounded-b-4xl lg:rounded-br-4xl">
                <Experience profile={profile} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

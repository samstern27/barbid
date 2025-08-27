// Use profile data instead of hardcoded data

// Theme configuration for qualifications component
// Each theme provides 3 color values: [bg-dark, text-light, text-dark]
const themeClasses = {
  amber: ["bg-amber-800", "text-amber-100", "text-amber-800"],
  blue: ["bg-blue-800", "text-blue-100", "text-blue-800"],
  cyan: ["bg-cyan-800", "text-cyan-100", "text-cyan-800"],
  emerald: ["bg-emerald-800", "text-emerald-100", "text-emerald-800"],
  fuchsia: ["bg-fuchsia-800", "text-fuchsia-100", "text-fuchsia-800"],
  gray: ["bg-gray-800", "text-gray-100", "text-gray-800"],
  green: ["bg-green-800", "text-green-100", "text-green-800"],
  indigo: ["bg-indigo-800", "text-indigo-100", "text-indigo-800"],
  lime: ["bg-lime-800", "text-lime-100", "text-lime-800"],
  neutral: ["bg-neutral-800", "text-neutral-100", "text-neutral-800"],
  orange: ["bg-orange-800", "text-orange-100", "text-orange-800"],
  pink: ["bg-pink-800", "text-pink-100", "text-pink-800"],
  purple: ["bg-purple-800", "text-purple-100", "text-purple-800"],
  red: ["bg-red-800", "text-red-100", "text-red-800"],
  rose: ["bg-rose-800", "text-rose-100", "text-rose-800"],
  sky: ["bg-sky-800", "text-sky-100", "text-sky-800"],
  slate: ["bg-slate-800", "text-slate-100", "text-slate-800"],
  stone: ["bg-stone-800", "text-stone-100", "text-stone-800"],
  teal: ["bg-teal-800", "text-teal-100", "text-teal-800"],
  violet: ["bg-violet-800", "text-violet-100", "text-violet-800"],
  yellow: ["bg-yellow-800", "text-yellow-100", "text-yellow-800"],
  zinc: ["bg-zinc-800", "text-zinc-100", "text-zinc-800"],
};

// Qualifications component for user profile displaying certifications and qualifications
// Features responsive layout with left-aligned text on mobile, right-aligned on large screens
export default function Qualifications({ profile }) {
  return (
    <div
      className={`min-w-1/3 mt-4 sm:mt-6 lg:mt-8 ml-4 sm:ml-6 lg:ml-8 mr-4 sm:mr-6 lg:mr-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 mb-4 sm:mb-6 lg:mb-8 flex flex-col gap-4 bg-gray-800`}
    >
      {/* Section header with responsive text alignment */}
      <div className="flex items-center justify-start lg:justify-end ">
        <h3
          className={`text-base font-semibold text-white w-full text-left lg:text-right border-b border-gray-200 pb-4 sm:pb-5`}
        >
          Qualifications & Certificates
        </h3>
      </div>

      {/* Conditional rendering based on qualifications data availability */}
      {profile.qualifications && profile.qualifications.length > 0 ? (
        <ul role="list" className="divide-y divide-gray-100">
          {profile.qualifications.map((qualification, index) => (
            <li
              key={`${qualification.name}-${index}`}
              className="flex gap-x-3 sm:gap-x-4 py-3 sm:py-4 text-left lg:text-right"
            >
              {/* Qualification details with responsive alignment */}
              <div className="min-w-0 lg:ml-auto text-left lg:text-right lg:mx-0">
                <p
                  className={`text-sm/6 font-semibold text-white text-left lg:text-right`}
                >
                  {qualification.name}
                </p>
                <p
                  className={`mt-1 truncate text-xs/5 text-white text-left lg:text-right`}
                >
                  {qualification.date}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        /* Empty state when no qualifications are available */
        <div className="py-8 text-center">
          <p className="text-sm text-gray-400">No qualifications added yet.</p>
        </div>
      )}
    </div>
  );
}

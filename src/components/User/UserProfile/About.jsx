import React from "react";

const About = ({ profile }) => {
  const aboutText =
    profile.about || `${profile.username} has not added an about section`;
  const theme = profile.theme || "gray";
  const themeClasses = {
    amber: ["bg-amber-800", "bg-amber-100", "text-amber-700", "#d97706"],
    blue: ["bg-blue-800", "bg-blue-100", "text-blue-700", "#3b82f6"],
    cyan: ["bg-cyan-800", "bg-cyan-100", "text-cyan-700", "#06b6d4"],
    emerald: [
      "bg-emerald-800",
      "bg-emerald-100",
      "text-emerald-700",
      "#10b981",
    ],
    fuchsia: [
      "bg-fuchsia-800",
      "bg-fuchsia-100",
      "text-fuchsia-700",
      "#d946ef",
    ],
    gray: ["bg-gray-800", "bg-gray-100", "text-gray-700", "#6b7280"],
    green: ["bg-green-800", "bg-green-100", "text-green-700", "#22c55e"],
    indigo: ["bg-indigo-800", "bg-indigo-100", "text-indigo-700", "#6366f1"],
    lime: ["bg-lime-800", "bg-lime-100", "text-lime-700", "#84cc16"],
    neutral: [
      "bg-neutral-800",
      "bg-neutral-100",
      "text-neutral-700",
      "#737373",
    ],
    orange: ["bg-orange-800", "bg-orange-100", "text-orange-800", "#f97316"],
    pink: ["bg-pink-800", "bg-pink-100", "text-pink-800", "#ec4899"],
    purple: ["bg-purple-800", "bg-purple-100", "text-purple-800", "#a855f7"],
    red: ["bg-red-800", "bg-red-100", "text-red-800", "#ef4444"],
    rose: ["bg-rose-800", "bg-rose-100", "text-rose-800", "#f43f5e"],
    sky: ["bg-sky-800", "bg-sky-100", "text-sky-800", "#0ea5e9"],
    slate: ["bg-slate-800", "bg-slate-100", "text-slate-800", "#64748b"],
    stone: ["bg-stone-800", "bg-stone-100", "text-stone-800", "#78716c"],
    teal: ["bg-teal-800", "bg-teal-100", "text-teal-800", "#14b8a6"],
    violet: ["bg-violet-800", "bg-violet-100", "text-violet-800", "#8b5cf6"],
    yellow: ["bg-yellow-800", "bg-yellow-100", "text-yellow-800", "#eab308"],
    zinc: ["bg-zinc-800", "bg-zinc-100", "text-zinc-800", "#71717a"],
  };
  return (
    <div
      className={`rounded-lg shadow-xl mt-10 mx-10 px-10 pt-10 pb-0 flex flex-col text-center gap-4 sm:p-6 lg:p-8 flex-1 items-start relative`}
      style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
    >
      <div className="relative">
        <h3
          className={`text-base font-semibold text-white border-b border-gray-200 pb-5 lg:mx-0 text-left relative z-10 `}
        >
          About me
        </h3>

        <p
          className={`text-base max-w-5xl font-normal sm:text-base mx-auto py-5 lg:mx-0 text-white relative z-10 italic text-left`}
        >
          {aboutText}
        </p>
      </div>
    </div>
  );
};

export default About;

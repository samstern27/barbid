import React from "react";

const themeClasses = {
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-blue-100 text-blue-600",
  cyan: "bg-cyan-100 text-cyan-600",
  emerald: "bg-emerald-100 text-emerald-600",
  fuchsia: "bg-fuchsia-100 text-fuchsia-600",
  gray: "bg-gray-100 text-gray-600",
  green: "bg-green-100 text-green-600",
  indigo: "bg-indigo-100 text-indigo-600",
  lime: "bg-lime-100 text-lime-600",
  neutral: "bg-neutral-100 text-neutral-600",
  orange: "bg-orange-100 text-orange-600",
  pink: "bg-pink-100 text-pink-600",
  purple: "bg-purple-100 text-purple-600",
  red: "bg-red-100 text-red-600",
  rose: "bg-rose-100 text-rose-600",
  sky: "bg-sky-100 text-sky-600",
  slate: "bg-slate-100 text-slate-600",
  stone: "bg-stone-100 text-stone-600",
  teal: "bg-teal-100 text-teal-600",
  violet: "bg-violet-100 text-violet-600",
  yellow: "bg-yellow-100 text-yellow-600",
  zinc: "bg-zinc-100 text-zinc-600",
};

const Skills = ({ profile }) => {
  const skills = profile.skills || [];
  const theme = profile.theme || "";
  const skillList = skills.map((skill, idx) => {
    return (
      <span
        key={skill + idx}
        className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ${themeClasses[theme]}`}
      >
        {skill}
      </span>
    );
  });
  return (
    <div className="mt-5 mx-4 sm:mx-6 lg:mx-8 flex flex-col items-center sm:items-start">
      <h3 className={`text-base font-semibold text-${theme}-900`}>Skills</h3>
      <div className="mt-4 flex flex-row flex-wrap gap-4">{skillList}</div>
    </div>
  );
};

export default Skills;

import React from "react";

const Skills = ({ profile }) => {
  const skills = profile.skills || [
    `${profile.username} has not added any skills`,
  ];
  const theme = profile.theme || "gray";

  const themeClasses = {
    amber: ["bg-amber-200", "text-amber-100", "text-amber-800"],
    blue: ["bg-blue-200", "text-blue-100", "text-blue-800"],
    cyan: ["bg-cyan-200", "text-cyan-100", "text-cyan-800"],
    emerald: ["bg-emerald-200", "text-emerald-100", "text-emerald-800"],
    fuchsia: ["bg-fuchsia-200", "text-fuchsia-100", "text-fuchsia-800"],
    gray: ["bg-gray-200", "text-gray-100", "text-gray-800"],
    green: ["bg-green-200", "text-green-100", "text-green-800"],
    indigo: ["bg-indigo-200", "text-indigo-100", "text-indigo-800"],
    lime: ["bg-lime-200", "text-lime-100", "text-lime-800"],
    neutral: ["bg-neutral-200", "text-neutral-100", "text-neutral-800"],
    orange: ["bg-orange-200", "text-orange-100", "text-orange-800"],
    pink: ["bg-pink-200", "text-pink-100", "text-pink-800"],
    purple: ["bg-purple-200", "text-purple-100", "text-purple-800"],
    red: ["bg-red-200", "text-red-100", "text-red-800"],
    rose: ["bg-rose-200", "text-rose-100", "text-rose-800"],
    sky: ["bg-sky-200", "text-sky-100", "text-sky-800"],
    slate: ["bg-slate-200", "text-slate-100", "text-slate-800"],
    stone: ["bg-stone-200", "text-stone-100", "text-stone-800"],
    teal: ["bg-teal-200", "text-teal-100", "text-teal-800"],
    violet: ["bg-violet-200", "text-violet-100", "text-violet-800"],
    yellow: ["bg-yellow-200", "text-yellow-100", "text-yellow-800"],
    zinc: ["bg-zinc-200", "text-zinc-100", "text-zinc-800"],
  };

  const skillList = skills.map((skill, idx) => {
    return (
      <span
        key={skill + idx}
        className={`w-fit rounded-md px-2 py-1 text-xs font-medium bg-white ${themeClasses[theme][2]} text-left`}
      >
        {skill}
      </span>
    );
  });
  return (
    <div
      className={`mt-4 sm:mt-6 lg:mt-8 mx-4 sm:mx-6 lg:mx-8 pb-4 sm:pb-6 lg:pb-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 flex-col text-center gap-4 flex-1 items-start`}
    >
      <h3
        className={`text-base font-semibold border-b border-gray-200 pb-4 sm:pb-5 text-left text-white`}
      >
        Skills
      </h3>
      <div className="mt-4 sm:mt-6 flex flex-col gap-2 sm:gap-3">
        {skillList}
      </div>
    </div>
  );
};

export default Skills;

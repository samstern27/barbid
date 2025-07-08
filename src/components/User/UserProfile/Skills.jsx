import React from "react";

const Skills = ({ profile }) => {
  const skills = profile.skills || [
    `${profile.username} has not added any skills`,
  ];
  const theme = profile.theme || "gray";

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

  const skillList = skills.map((skill, idx) => {
    return (
      <span
        key={skill + idx}
        className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ${themeClasses[theme][0]} ${themeClasses[theme][1]}`}
      >
        {skill}
      </span>
    );
  });
  return (
    <div
      className={`px-4 pb-10 flex flex-col text-center gap-4 sm:px-6 lg:text-left lg:px-8 flex-1 items-center lg:items-start max-w-2xl mx-auto lg:mx-0 lg:-ml-8 ${themeClasses[theme][1]}`}
    >
      <h3
        className={`text-3xl font-light ${themeClasses[theme][2]} mx-auto lg:mx-0 text-center lg:text-left`}
      >
        Skills
      </h3>
      <div className="mt-4 flex flex-row flex-wrap gap-4 justify-center lg:justify-start lg:ml-7">
        {skillList}
      </div>
    </div>
  );
};

export default Skills;

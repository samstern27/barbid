const stats = [
  { name: "Total hours", value: "405" },
  { name: "Shifts completed", value: "15" },
  { name: "On Barbid for", value: "3", unit: "months" },
  { name: "Last active", value: "10", unit: "days ago" },
];

const themeClasses = {
  amber: ["bg-amber-600", "bg-amber-500", "text-amber-700", "#d97706"],
  blue: ["bg-blue-600", "bg-blue-500", "text-blue-700", "#3b82f6"],
  cyan: ["bg-cyan-600", "bg-cyan-500", "text-cyan-700", "#06b6d4"],
  emerald: ["bg-emerald-600", "bg-emerald-500", "text-emerald-700", "#10b981"],
  fuchsia: ["bg-fuchsia-600", "bg-fuchsia-500", "text-fuchsia-700", "#d946ef"],
  gray: ["bg-gray-600", "bg-gray-500", "text-gray-700", "#6b7280"],
  green: ["bg-green-600", "bg-green-500", "text-green-700", "#22c55e"],
  indigo: ["bg-indigo-600", "bg-indigo-500", "text-indigo-700", "#6366f1"],
  lime: ["bg-lime-600", "bg-lime-500", "text-lime-700", "#84cc16"],
  neutral: ["bg-neutral-600", "bg-neutral-500", "text-neutral-700", "#737373"],
  orange: ["bg-orange-600", "bg-orange-500", "text-orange-800", "#f97316"],
  pink: ["bg-pink-600", "bg-pink-500", "text-pink-800", "#ec4899"],
  purple: ["bg-purple-600", "bg-purple-500", "text-purple-800", "#a855f7"],
  red: ["bg-red-600", "bg-red-500", "text-red-800", "#ef4444"],
  rose: ["bg-rose-600", "bg-rose-500", "text-rose-800", "#f43f5e"],
  sky: ["bg-sky-600", "bg-sky-500", "text-sky-800", "#0ea5e9"],
  slate: ["bg-slate-600", "bg-slate-500", "text-slate-800", "#64748b"],
  stone: ["bg-stone-600", "bg-stone-500", "text-stone-800", "#78716c"],
  teal: ["bg-teal-600", "bg-teal-500", "text-teal-800", "#14b8a6"],
  violet: ["bg-violet-600", "bg-violet-500", "text-violet-800", "#8b5cf6"],
  yellow: ["bg-yellow-600", "bg-yellow-500", "text-yellow-800", "#eab308"],
  zinc: ["bg-zinc-600", "bg-zinc-500", "text-zinc-800", "#71717a"],
};

export default function Stats({ profile }) {
  return (
    <div>
      <div className="shadow-xl shadow-black/20">
        <div className="grid grid-cols-2 gap-0.25 bg-white/10  lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white px-4 py-6 sm:px-6 lg:px-8 flex flex-col items-center"
            >
              <p className="text-sm/6 font-medium text-gray-400">{stat.name}</p>
              <p className="mt-2 flex items-baseline gap-x-2">
                <span
                  className={`text-4xl font-semibold tracking-tight ${
                    themeClasses[profile.theme][2]
                  }`}
                >
                  {stat.value}
                </span>
                {stat.unit ? (
                  <span className="text-sm text-gray-400">{stat.unit}</span>
                ) : null}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

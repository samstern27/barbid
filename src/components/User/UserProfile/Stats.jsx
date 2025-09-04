import { useState, useEffect, useMemo, useCallback } from "react";
import { getDatabase, ref, get } from "firebase/database";

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

export default function Stats({ profile, className = "" }) {
  const [stats, setStats] = useState([
    { name: "Total hours", value: "0", unit: "hrs" },
    { name: "Shifts completed", value: "0" },
    { name: "On Barbid for", value: "0", unit: "months" },
    { name: "Last active", value: "0", unit: "days ago" },
  ]);

  useEffect(() => {
    const calculateStats = async () => {
      if (!profile.id) return;

      const db = getDatabase();

      // Calculate account age in months
      const accountAge = calculateAccountAge(profile.createdAt || profile.id);

      // Calculate last active
      const lastActive = calculateLastActive(profile.lastActive || profile.id);

      // Fetch shift completion data
      const { shiftsCompleted, totalHours } = await fetchShiftStats(
        db,
        profile.id
      );

      setStats([
        { name: "Total hours", value: totalHours.toString(), unit: "hrs" },
        { name: "Shifts completed", value: shiftsCompleted.toString() },
        {
          name: "On Barbid for",
          value: accountAge,
          unit: "",
          isFormatted: true,
        }, // accountAge is now a string like "2 days"
        { name: "Last active", value: lastActive.toString(), unit: "days ago" },
      ]);
    };

    calculateStats();
  }, [profile.id, profile.createdAt, profile.lastActive]);

  const calculateAccountAge = useCallback((createdAt) => {
    if (!createdAt) return 0;

    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If less than 30 days, show in days
    if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    }

    // If more than 30 days, show in months
    const diffMonths = Math.ceil(diffDays / 30.44);
    return `${diffMonths} month${diffMonths !== 1 ? "s" : ""}`;
  }, []);

  const calculateLastActive = useCallback((lastActive) => {
    if (!lastActive) return 0;

    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffTime = Math.abs(now - lastActiveDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }, []);

  const fetchShiftStats = async (db, userId) => {
    try {
      // Fetching shift stats for user

      // Get shift stats directly from user profile
      const userProfileRef = ref(db, `users/${userId}/profile`);
      const snapshot = await get(userProfileRef);

      if (!snapshot.exists()) {
        // No user profile found
        return { shiftsCompleted: 0, totalHours: 0 };
      }

      const profile = snapshot.val();
      let shiftsCompleted = profile.shiftCount || 0;
      let totalHours = profile.totalHoursWorked || 0;

      // If profile doesn't have shift stats, migrate from existing data
      if (!profile.shiftCount && !profile.totalHoursWorked) {
        // Migrating shift stats from existing data
        const migratedStats = await migrateShiftStats(db, userId);
        shiftsCompleted = migratedStats.shiftsCompleted;
        totalHours = migratedStats.totalHours;

        // Update profile with migrated stats
        await update(userProfileRef, {
          shiftCount: shiftsCompleted,
          totalHoursWorked: totalHours,
        });
      }

      // Profile stats updated

      return {
        shiftsCompleted,
        totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal place
      };
    } catch (error) {
      return { shiftsCompleted: 0, totalHours: 0 };
    }
  };

  // Migration function to calculate stats from existing completed shifts
  const migrateShiftStats = async (db, userId) => {
    try {
      const publicJobsRef = ref(db, `public/jobs`);
      const snapshot = await get(publicJobsRef);

      if (!snapshot.exists()) {
        return { shiftsCompleted: 0, totalHours: 0 };
      }

      const allJobs = snapshot.val();
      let shiftsCompleted = 0;
      let totalHours = 0;

      // Check each job for completed shifts where this user was accepted
      Object.entries(allJobs).forEach(([jobId, job]) => {
        if (job.acceptedUserId === userId) {
          // Check for various completed statuses (including old ones)
          if (
            job.status === "Completed" ||
            job.status === "completed" ||
            job.status === "Accepted" ||
            job.status === "accepted" ||
            job.status === "Filled" ||
            job.status === "filled" ||
            // Also check if the job has passed its end time (for old shifts)
            (job.endOfShift && new Date() > new Date(job.endOfShift))
          ) {
            shiftsCompleted++;

            // Calculate hours from shift duration
            if (job.startOfShift && job.endOfShift) {
              const startTime = new Date(job.startOfShift);
              const endTime = new Date(job.endOfShift);
              const durationHours = (endTime - startTime) / (1000 * 60 * 60);
              totalHours += durationHours;
            }
          }
        }
      });

      // Migration completed
      return { shiftsCompleted, totalHours };
    } catch (error) {
      return { shiftsCompleted: 0, totalHours: 0 };
    }
  };

  return (
    <div className={className}>
      <div className="shadow-xl shadow-black/20">
        <div className="grid grid-cols-2 gap-0.25 bg-white/10  lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white px-4 py-6 sm:px-6 lg:px-8 flex flex-col items-center"
            >
              <p className="text-sm/6 font-medium text-gray-400">{stat.name}</p>
              <p className="mt-2 flex items-baseline gap-x-2">
                {stat.isFormatted ? (
                  // Special formatting for account age
                  <span className="flex items-baseline gap-x-1">
                    <span
                      className={`text-4xl font-semibold tracking-tight ${
                        themeClasses[profile.theme][2]
                      }`}
                    >
                      {stat.value.split(" ")[0]}
                    </span>
                    <span className="text-sm text-gray-400">
                      {stat.value.split(" ").slice(1).join(" ")}
                    </span>
                  </span>
                ) : (
                  // Normal formatting for other stats
                  <>
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
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

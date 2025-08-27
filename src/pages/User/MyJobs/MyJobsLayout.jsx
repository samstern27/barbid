import { NavLink, Outlet, useNavigate, useLocation, useParams } from "react-router-dom";
import Breadcrumb from "../../../components/UI/Breadcrumb";
import { getDatabase, ref, onValue } from "firebase/database";
import { useAuth } from "../../../contexts/AuthContext";
import { useState, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import Loader from "../../../components/UI/Loader";
import { JobProvider, useJob } from "../../../contexts/JobContext";

// Utility function to conditionally join CSS classes
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Main content component for MyJobs layout
// Manages job data fetching, navigation tabs, and conditional rendering
const MyJobsLayoutContent = () => {
  // Route parameters and navigation hooks
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { selectJobById } = useJob();

  // Local state for job data and loading
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Route mode detection for conditional rendering
  const isOverviewMode = !jobId;
  const isApplicationDetailMode =
    jobId && location.pathname.includes("/application/");

  // Fetch job data using jobId from params (only when in detail mode, not application detail)
  // Updates JobContext with selected job for child components
  useEffect(() => {
    if (isOverviewMode || isApplicationDetailMode) {
      setLoading(false);
      return;
    }

    if (!jobId || !currentUser?.uid) {
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const jobRef = ref(db, `users/${currentUser.uid}/jobs/${jobId}`);

    const unsubscribe = onValue(jobRef, (snapshot) => {
      if (snapshot.exists()) {
        const jobData = { id: jobId, ...snapshot.val() };
        setJob(jobData);
        // Update the JobContext with the current job
        selectJobById(jobId);
      } else {
        // Job not found, redirect to active jobs
        navigate("/jobs/active");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [
    jobId,
    currentUser?.uid,
    navigate,
    selectJobById,
    isOverviewMode,
    isApplicationDetailMode,
  ]);

  // Navigation tabs configuration
  const tabs = [
    {
      name: "Active",
      href: "/jobs/active",
    },
    {
      name: "Accepted",
      href: "/jobs/accepted",
    },
    {
      name: "Rejected",
      href: "/jobs/rejected",
    },
  ];

  // Breadcrumb navigation configuration
  const pages = [{ name: "Jobs", href: "/jobs", current: false }];

  return (
    <div className="flex flex-col m-10 gap-6">
      {/* Navigation breadcrumb */}
      <Breadcrumb pages={pages} />
      
      {/* Header section with title and navigation tabs */}
      <div className="border-b border-gray-200 pb-5 sm:pb-0 animate-[fadeIn_0.6s_ease-in-out]">
        {/* Dynamic title based on current route mode */}
        <h3 className="text-base font-semibold text-gray-900">
          {isOverviewMode ? "My Jobs" : isApplicationDetailMode ? "Job Application Details" : job?.title}
        </h3>

        {/* Tab navigation - responsive design with mobile dropdown and desktop tabs */}
        <div className="mt-3 sm:mt-4">
          {/* Mobile dropdown navigation */}
          <div className="grid grid-cols-1 sm:hidden">
            <select
              value={
                tabs.find((tab) => location.pathname.startsWith(tab.href))
                  ?.name || "Active"
              }
              onChange={(e) => {
                const selectedTab = tabs.find(
                  (tab) => tab.name === e.target.value
                );
                if (selectedTab) {
                  navigate(selectedTab.href);
                }
              }}
              aria-label="Select a tab"
              className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            >
              {tabs.map((tab) => (
                <option key={tab.name} value={tab.name}>
                  {tab.name}
                </option>
              ))}
            </select>
            {/* Dropdown arrow icon */}
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500"
            />
          </div>
          
          {/* Desktop tab navigation */}
          <div className="hidden sm:block">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.name}
                  to={tab.href}
                  className={({ isActive }) =>
                    classNames(
                      isActive
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                      "border-b-2 px-1 pb-4 text-sm font-medium whitespace-nowrap"
                    )
                  }
                >
                  {tab.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Conditional rendering based on loading state */}
      {loading ? (
        /* Loading state with spinner */
        <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
          <Loader size="2xl" text="Loading job..." />
        </div>
      ) : (
        /* Render child routes via Outlet */
        <Outlet />
      )}
    </div>
  );
};

// Main MyJobsLayout component with context providers
// Wraps content with JobProvider for job data access
const MyJobsLayout = () => {
  return (
    <JobProvider>
      <MyJobsLayoutContent />
    </JobProvider>
  );
};

export default MyJobsLayout;

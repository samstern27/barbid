import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import Breadcrumb from "../../UI/Breadcrumb";
import { useParams } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import { useAuth } from "../../../contexts/AuthContext";
import { useBusiness } from "../../../contexts/BusinessContext";
import { useState, useEffect, createContext } from "react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import Loader from "../../UI/Loader";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const businessContext = createContext();

const MyBusinessDetailLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { selectBusinessById, selectedBusiness } = useBusiness();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Select the business in the context when component loads
    if (id) {
      selectBusinessById(id);
    }
  }, [id, selectBusinessById]);

  useEffect(() => {
    const db = getDatabase();
    const businessRef = ref(
      db,
      "users/" + currentUser?.uid + "/business/" + id
    );
    onValue(businessRef, (snapshot) => {
      setBusiness(snapshot.val());
      setLoading(false);
    });
  }, [currentUser, id]);

  const tabs = [
    { name: "Overview", href: `/my-business/${id}/overview` },
    {
      name: "Job Listings",
      href: `/my-business/${id}/job-listings`,
    },
    {
      name: "Past Candidates",
      href: `/my-business/${id}/past-candidates`,
    },
    { name: "Reviews", href: `/my-business/${id}/reviews` },
    { name: "Settings", href: `/my-business/${id}/settings` },
  ];

  const pages = [
    { name: "Businesses", href: "/my-business", current: false },
    {
      name: business?.name,
      href: `/my-business/${id}/overview`,
      current: true,
    },
  ];

  return (
    <div className="flex flex-col m-10 gap-6">
      <Breadcrumb pages={pages} />
      <div className="border-b border-gray-200 pb-5 sm:pb-0 animate-[fadeIn_0.6s_ease-in-out]">
        <h3 className="text-base font-semibold text-gray-900">
          {business?.name}
        </h3>
        <div className="mt-3 sm:mt-4">
          <div className="grid grid-cols-1 sm:hidden">
            <select
              value={
                tabs.find((tab) => location.pathname.startsWith(tab.href))
                  ?.name || "Overview"
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
              className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600"
            >
              {tabs.map((tab) => (
                <option key={tab.name} value={tab.name}>
                  {tab.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500"
            />
          </div>
          <div className="hidden sm:block">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.name}
                  to={tab.href}
                  className={({ isActive }) =>
                    classNames(
                      isActive
                        ? "border-red-600 text-red-600"
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
      {loading ? (
        <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
          <Loader size="2xl" text="Loading business..." />
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default MyBusinessDetailLayout;

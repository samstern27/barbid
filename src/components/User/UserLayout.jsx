"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { getDatabase, ref, onValue, get } from "firebase/database";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
} from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
  XMarkIcon,
  HomeIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Notification from "../UI/Notification";

// Utility function to conditionally join CSS classes
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Main user layout component providing navigation sidebar and top bar
// Features responsive design with mobile sidebar and desktop fixed sidebar
export default function UserLayout() {
  const { currentUser, logout } = useAuth();
  const { toggleNotificationPanel, unreadCount } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Fetch user data from Firebase on component mount
  useEffect(() => {
    const db = getDatabase();
    const reference = ref(db, "users/" + currentUser?.uid);
    onValue(reference, (snapshot) => {
      const data = snapshot.val();
      setUserData(data);
    });
  }, [currentUser]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for users as user types
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      setShowResults(true);

      try {
        const db = getDatabase();

        // Get all usernames and filter for partial matches
        const usernamesRef = ref(db, "usernames");
        const snapshot = await get(usernamesRef);

        if (snapshot.exists()) {
          const usernames = snapshot.val();
          const matchingUsernames = Object.keys(usernames).filter((username) =>
            username.toLowerCase().includes(searchQuery.toLowerCase())
          );

          // Limit results to first 10 matches
          const limitedResults = matchingUsernames.slice(0, 10);

          // Fetch profile data for matching users
          const results = await Promise.all(
            limitedResults.map(async (username) => {
              const userId = usernames[username];
              const profileRef = ref(db, `users/${userId}/profile`);
              const personalRef = ref(db, `users/${userId}/personal`);

              try {
                // Get profile data
                const profileSnapshot = await get(profileRef);
                const profile = profileSnapshot.val() || {};

                // Try to get personal data for city info
                let personal = {};
                try {
                  const personalSnapshot = await get(personalRef);
                  personal = personalSnapshot.val() || {};
                } catch (personalError) {
                  // If we can't access personal data, just continue without city info
                }

                return {
                  userId,
                  username,
                  firstName: profile.firstName || "",
                  lastName: profile.lastName || "",
                  avatar: profile.avatar || "",
                  city: personal.city || "",
                };
              } catch (error) {
                // If we can't access profile data, just return basic info
                return {
                  userId,
                  username,
                  firstName: "",
                  lastName: "",
                  avatar: "",
                  city: "",
                };
              }
            })
          );

          // Filter out null results and set search results
          setSearchResults(results.filter((result) => result !== null));
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        // If we can't access usernames, just return empty results
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Generate initials from first and last name
  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last;
  };

  // Handle result click - navigate to user profile
  const handleResultClick = (username) => {
    setSearchQuery("");
    setShowResults(false);
    navigate(`/profile/${username}`);
  };

  // Navigation items with dynamic profile href
  // Memoized to prevent recreation on every render
  const navigation = useMemo(() => {
    // Build navigation with dynamic profile href based on user data
    const profileHref = `profile/${
      userData?.profile?.username || currentUser?.uid
    }`;

    return [
      {
        name: "Home",
        href: "/",
        icon: HomeIcon,
      },
      {
        name: "Profile",
        href: profileHref,
        icon: UserIcon,
      },
      {
        name: "My Jobs",
        href: "jobs",
        icon: BriefcaseIcon,
      },
      {
        name: "Find Work",
        href: "find-work",
        icon: MagnifyingGlassIcon,
      },
      {
        name: "My Business",
        href: "my-business",
        icon: BuildingStorefrontIcon,
      },
      {
        name: "Notifications",
        href: "activity",
        icon: BellIcon,
      },
    ];
  }, [userData, currentUser]);

  return (
    <>
      <div>
        {/* Mobile Sidebar Dialog */}
        <Dialog
          open={sidebarOpen}
          onClose={setSidebarOpen}
          className="relative z-50 lg:hidden"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/50 transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
            >
              {/* Close button positioned outside sidebar */}
              <TransitionChild>
                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                  <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="-m-2.5 p-2.5"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      aria-hidden="true"
                      className="size-6 text-white"
                    />
                  </button>
                </div>
              </TransitionChild>

              {/* Mobile Sidebar Content */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-gray-950 to-gray-900 px-6 pb-4 ring-1 ring-white/10">
                {/* Brand header */}
                <div className="flex h-16 shrink-0 items-center">
                  <h1 className="text-2xl font-medium text-indigo-600 tracking-widest">
                    barbid
                  </h1>
                </div>

                {/* Navigation menu */}
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <NavLink
                              aria-label={item.name}
                              to={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={({ isActive }) =>
                                classNames(
                                  isActive
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-indigo-600",
                                  "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                                )
                              }
                            >
                              <item.icon
                                aria-hidden="true"
                                className="size-6 shrink-0"
                              />
                              {item.name}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </li>

                    {/* Settings and logout section at bottom */}
                    <li className="mt-auto">
                      <div className="space-y-1 bg-gray-800 p-3 -mx-6 -mb-4 relative">
                        {/* Subtle pattern overlay */}
                        <div
                          className="absolute inset-0 opacity-5"
                          style={{
                            backgroundImage: `repeating-linear-gradient(
                              45deg,
                              transparent,
                              transparent 4px,
                              rgba(255, 255, 255, 0.5) 4px,
                              rgba(255, 255, 255, 0.5) 5px
                            )`,
                          }}
                        />
                        <div className="relative z-10 space-y-1">
                          <NavLink
                            to="/settings"
                            aria-label="Settings"
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                              classNames(
                                isActive
                                  ? "bg-gray-600 text-white"
                                  : "text-gray-400 hover:bg-gray-700 hover:text-indigo-600",
                                "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                              )
                            }
                          >
                            <Cog6ToothIcon
                              aria-hidden="true"
                              className="size-6 shrink-0"
                            />
                            Settings
                          </NavLink>
                          <button
                            onClick={() => {
                              logout();
                              setSidebarOpen(false);
                            }}
                            aria-label="Sign out"
                            className="group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-700 hover:text-indigo-600"
                          >
                            <svg
                              className="size-6 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Sign out
                          </button>
                        </div>
                      </div>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Desktop Fixed Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-gray-950 to-gray-900 px-6 pb-4 shadow-2xl">
            {/* Brand header */}
            <div className="flex h-16 shrink-0 items-center">
              <span className="sr-only">barbid</span>
              <h1 className="text-2xl font-medium text-indigo-300 tracking-widest">
                barbid
              </h1>
            </div>

            {/* Navigation menu */}
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          aria-label={item.name}
                          className={({ isActive }) =>
                            classNames(
                              isActive
                                ? "bg-indigo-600 text-white"
                                : "text-gray-400 hover:bg-gray-800 hover:text-indigo-300",
                              "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                            )
                          }
                        >
                          <item.icon
                            aria-hidden="true"
                            className="size-6 shrink-0"
                          />
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>

                {/* Settings and logout section at bottom */}
                <li className="mt-auto">
                  <div className="space-y-1 bg-gray-800 p-3 -mx-6 -mb-4 relative">
                    {/* Subtle pattern overlay */}
                    <div
                      className="absolute inset-0 opacity-5"
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 4px,
                          rgba(255, 255, 255, 0.5) 4px,
                          rgba(255, 255, 255, 0.5) 5px
                        )`,
                      }}
                    />
                    <div className="relative z-10 space-y-1">
                      <NavLink
                        to="/settings"
                        aria-label="Settings"
                        className={({ isActive }) =>
                          classNames(
                            isActive
                              ? "bg-indigo-600 text-white"
                              : "text-gray-400 hover:bg-gray-700 hover:text-indigo-300",
                            "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                          )
                        }
                      >
                        <Cog6ToothIcon
                          aria-hidden="true"
                          className="size-6 shrink-0"
                        />
                        Settings
                      </NavLink>
                      <button
                        onClick={() => logout()}
                        aria-label="Sign out"
                        className="group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-700 hover:text-indigo-300"
                      >
                        <svg
                          className="size-6 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content area with top bar */}
        <div className="lg:pl-72">
          {/* Top navigation bar */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
            {/* Mobile sidebar toggle button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>

            {/* Visual separator for mobile */}
            <div
              aria-hidden="true"
              className="h-6 w-px bg-gray-900/10 lg:hidden"
            />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              {/* Search form */}
              <div ref={searchRef} className="relative grid flex-1 grid-cols-1">
                <input
                  name="search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a profile"
                  aria-label="Search"
                  className="col-start-1 row-start-1 block size-full bg-white pl-8 text-base text-gray-900 outline-hidden placeholder:text-gray-400 sm:text-sm/6"
                />
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 size-5 self-center text-gray-400"
                />

                {/* Search results dropdown */}
                {showResults &&
                  (isSearching ||
                    searchResults.length > 0 ||
                    (searchQuery.length >= 1 && !isSearching)) && (
                    <div className="fixed top-16 left-4 right-4 mt-4 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto lg:absolute lg:w-1/2 lg:left-1/4 lg:-translate-x-1/2 lg:mt-8">
                      {isSearching ? (
                        <div className="p-4 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mx-auto"></div>
                          <p className="mt-2 text-sm">Searching...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="py-1">
                          {searchResults.map((user) => (
                            <button
                              key={user.userId}
                              onClick={() => handleResultClick(user.username)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150"
                            >
                              <div className="flex items-center space-x-3">
                                {/* Avatar/Initials */}
                                <div className="flex-shrink-0">
                                  {user.avatar ? (
                                    <img
                                      src={user.avatar}
                                      alt={`${user.firstName} ${user.lastName}`}
                                      className="h-8 w-8 rounded-full"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                                      {getInitials(
                                        user.firstName,
                                        user.lastName
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* User info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      @{user.username}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <p className="text-xs text-gray-500 truncate">
                                      {getInitials(
                                        user.firstName,
                                        user.lastName
                                      )}
                                    </p>
                                    {user.city && (
                                      <>
                                        <span className="text-gray-300">•</span>
                                        <p className="text-xs text-gray-500 truncate">
                                          {user.city}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : searchQuery.length >= 1 ? (
                        <div className="p-4 text-center text-gray-500">
                          <p className="text-sm">No users found</p>
                        </div>
                      ) : null}
                    </div>
                  )}
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* Notification bell with badge */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleNotificationPanel}
                    className="-m-2.5 p-2.5 text-indigo-600 hover:text-indigo-500 transition-all duration-200 cursor-pointer hover:scale-110 relative -mt-1"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon
                      aria-hidden="true"
                      className={`size-8 text-indigo-600 transition-transform duration-200 ${
                        unreadCount > 0 ? "animate-pulse" : ""
                      }`}
                    />

                    {/* Notification count badge */}
                    {unreadCount > 0 && (
                      <span className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 text-[10px] font-medium transition-opacity duration-200 animate-pulse-reverse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Notification dropdown component */}
                <Notification />

                {/* Visual separator for desktop */}
                <div
                  aria-hidden="true"
                  className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10"
                />
              </div>
            </div>
          </div>

          {/* Main content area */}
          <main className="py-0">
            <div className="px-0 sm:px-0 lg:px-0 min-h-screen">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

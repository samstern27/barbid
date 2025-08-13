"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
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
  IdentificationIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Notification from "../UI/Notification";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function UserLayout() {
  const { currentUser, logout } = useAuth();
  const { toggleNotificationPanel, unreadCount } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const db = getDatabase();
    const reference = ref(db, "users/" + currentUser?.uid);
    onValue(reference, (snapshot) => {
      const data = snapshot.val();
      setUserData(data);
    });
  }, [currentUser]);
  const navigation = [
    { name: "Home", href: "/", icon: HomeIcon },
    {
      name: "My Jobs",
      href: "/jobs",
      icon: BriefcaseIcon,
    },
    {
      name: "Find Work",
      href: "/find-work",
      icon: MagnifyingGlassIcon,
    },
    {
      name: "My Business",
      href: "/my-business",
      icon: BuildingStorefrontIcon,
    },
    {
      name: "Roles",
      href: "/roles",
      icon: IdentificationIcon,
    },
    { name: "Reviews", href: "/reviews", icon: StarIcon },
  ];
  const businesses = [
    {
      id: 1,
      name: "The Better Half",
      href: "#",
      initial: "TBH",
    },
  ];

  return (
    <>
      <div>
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

              {/* Mobile Sidebar */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-950 px-6 pb-4 ring-1 ring-white/10">
                <div className="flex h-16 shrink-0 items-center">
                  <h1 className="text-2xl font-medium text-indigo-600 tracking-widest">
                    barbid
                  </h1>
                </div>
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
                    <li>
                      <div className="text-xs/6 font-semibold text-gray-400">
                        Your Businesses
                      </div>
                      <ul role="list" className="-mx-2 mt-2 space-y-1">
                        {businesses.map((business) => (
                          <li key={business.name}>
                            <NavLink
                              aria-label={business.name}
                              to={business.href}
                              className={classNames(
                                business.current
                                  ? "bg-indigo-600 text-white"
                                  : "text-gray-400 hover:bg-gray-800 hover:text-indigo-600",
                                "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                              )}
                            >
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                                {business.initial}
                              </span>
                              <span className="truncate">{business.name}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li className="mt-auto">
                      <NavLink
                        to="/settings"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Settings"
                        className={({ isActive }) =>
                          classNames(
                            isActive
                              ? "bg-indigo-600 text-white"
                              : "text-gray-400 hover:bg-gray-800 hover:text-indigo-600",
                            "group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                          )
                        }
                      >
                        <Cog6ToothIcon
                          aria-hidden="true"
                          className="size-6 shrink-0"
                        />
                        Settings
                      </NavLink>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-950 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <span className="sr-only">barbid</span>
              <h1 className="text-2xl font-medium text-indigo-300 tracking-widest">
                barbid
              </h1>
            </div>
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
                <li>
                  <div className="text-xs/6 font-semibold text-gray-400">
                    Your Businesses
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {businesses.map((business) => (
                      <li key={business.name}>
                        <NavLink
                          to={business.href}
                          aria-label={business.name}
                          className={classNames(
                            business.current
                              ? "bg-indigo-600 text-white"
                              : "text-gray-400 hover:bg-gray-800 hover:text-indigo-300",
                            "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                          )}
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                            {business.initial}
                          </span>
                          <span className="truncate">{business.name}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="mt-auto">
                  <NavLink
                    to="/settings"
                    aria-label="Settings"
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-indigo-300",
                        "group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                      )
                    }
                  >
                    <Cog6ToothIcon
                      aria-hidden="true"
                      className="size-6 shrink-0"
                    />
                    Settings
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8 relative">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>

            {/* Separator */}
            <div
              aria-hidden="true"
              className="h-6 w-px bg-gray-900/10 lg:hidden"
            />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <form action="#" method="GET" className="grid flex-1 grid-cols-1">
                <input
                  name="search"
                  type="search"
                  placeholder="Search for a profile"
                  aria-label="Search"
                  className="col-start-1 row-start-1 block size-full bg-white pl-8 text-base text-gray-900 outline-hidden placeholder:text-gray-400 sm:text-sm/6"
                />
                <MagnifyingGlassIcon
                  aria-hidden="true"
                  className="pointer-events-none col-start-1 row-start-1 size-5 self-center text-gray-400"
                />
              </form>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
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

                    {/* Notification badge */}
                    {unreadCount > 0 && (
                      <span className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600 text-[10px] font-medium transition-opacity duration-200 animate-pulse-reverse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Notification positioned relative to main page container */}
                <Notification />

                {/* Separator */}
                <div
                  aria-hidden="true"
                  className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10"
                />

                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <MenuButton className="-m-1.5 flex items-center p-1.5 focus:outline-indigo-600">
                    <span className="sr-only">Open user menu</span>
                    <img
                      alt={userData?.profile?.username}
                      src={userData?.profile?.profilePicture}
                      className="size-8 rounded-full bg-white object-cover"
                    />
                    <span className="hidden lg:flex lg:items-center">
                      <span
                        aria-hidden="true"
                        className="ml-4 text-sm/6 font-semibold text-gray-900"
                      >
                        {userData?.profile?.username}
                      </span>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="ml-2 size-5 text-gray-400"
                      />
                    </span>
                  </MenuButton>
                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                  >
                    <MenuItem>
                      <NavLink
                        to={"/profile/" + userData?.profile?.username}
                        aria-label="Your profile"
                        className="block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-indigo-50 data-focus:outline-hidden"
                      >
                        Your profile
                      </NavLink>
                    </MenuItem>
                    <MenuItem>
                      <button
                        onClick={() => logout()}
                        aria-label="Sign out"
                        className="block w-full text-left px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-indigo-50 data-focus:outline-hidden"
                      >
                        Sign out
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>

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

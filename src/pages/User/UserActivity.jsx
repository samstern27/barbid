import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";

import { useAuth } from "../../contexts/AuthContext";
import Breadcrumb from "../../components/UI/Breadcrumb";
import { TrashIcon, EyeIcon } from "@heroicons/react/24/outline";

const pages = [{ name: "Notifications", href: "/activity", current: true }];

const UserActivity = () => {
  const navigate = useNavigate();
  const { notifications, removeNotification, markAsRead } = useNotification();
  const [isLoaded, setIsLoaded] = useState(false);

  const { currentUser } = useAuth();

  useEffect(() => {
    // Set loaded state after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Handle navigation based on notification type
    if (
      notification.type === "job_application" &&
      notification.jobId &&
      notification.businessId
    ) {
      // Navigate to the job applicants list for business owners
      navigate(
        `/my-business/${notification.businessId}/job-listings/${notification.jobId}/applicants`
      );
    } else if (notification.type === "job_accepted" && notification.jobId) {
      // Navigate to the job application detail for accepted jobs
      navigate(`/jobs/application/${notification.jobId}`);
    } else if (notification.type === "job_completed" && notification.jobId) {
      // Navigate to the job application detail for completed jobs
      navigate(`/jobs/application/${notification.jobId}`);
    } else if (
      notification.type === "job_auto_closed" &&
      notification.jobId &&
      notification.businessId
    ) {
      // Navigate to the job details page for auto-closed jobs
      navigate(
        `/my-business/${notification.businessId}/job-listings/${notification.jobId}`
      );
    }
  };

  // Handle notification removal
  const handleRemoveNotification = (e, notificationId) => {
    e.stopPropagation();
    removeNotification(notificationId);
  };

  return (
    <div className="flex flex-col m-10 gap-4">
      <Breadcrumb pages={pages} />

      {/* Notifications Section */}
      <div
        className={`bg-white shadow rounded-lg transition-all duration-700 ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500">
            All your notifications and updates
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-all duration-500 ease-out cursor-pointer ${
                  !notification.isRead ? "bg-blue-50/30" : ""
                } ${
                  isLoaded
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-4"
                }`}
                style={{
                  transitionDelay: `${(index + 1) * 100}ms`,
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full flex-shrink-0 bg-gray-100 flex items-center justify-center">
                    {notification.avatar ? (
                      <img
                        src={notification.avatar}
                        alt={notification.title}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 text-gray-600">
                        {notification.type === "job_accepted" ? (
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : notification.type === "job_completed" ||
                          notification.type === "shift_completed" ? (
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : notification.type === "job_application" ? (
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : notification.type === "job_auto_closed" ? (
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-3">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {notification.message}
                    </p>
                    {!notification.isRead && (
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-xs text-blue-600 font-medium">
                          New
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) =>
                        handleRemoveNotification(e, notification.id)
                      }
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                      title="Remove notification"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              className={`px-6 py-8 text-center transition-all duration-700 ease-out delay-300 ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No notifications yet</p>
              <p className="text-gray-400 text-xs mt-1">
                We'll notify you when something happens
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivity;

import React from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";
import { useBusiness } from "../../contexts/BusinessContext";
import { getDatabase, ref, update } from "firebase/database";
import { useAuth } from "../../contexts/AuthContext";
import Breadcrumb from "../../components/UI/Breadcrumb";
import { TrashIcon, EyeIcon } from "@heroicons/react/24/outline";

const pages = [{ name: "Activity", href: "/activity", current: true }];

const UserActivity = () => {
  const navigate = useNavigate();
  const { notifications, removeNotification, markAsRead } = useNotification();
  const { businesses } = useBusiness();
  const { currentUser } = useAuth();

  // Function to fix business privacy
  const fixBusinessPrivacy = async (businessId) => {
    if (!currentUser?.uid) return;

    try {
      const db = getDatabase();
      const businessRef = ref(
        db,
        `users/${currentUser.uid}/business/${businessId}`
      );
      await update(businessRef, { privacy: "public" });
      alert(
        "Business privacy changed to public! Jobs should now appear in Find Work."
      );
    } catch (error) {
      console.error("Error updating business privacy:", error);
      alert("Failed to update business privacy. Please try again.");
    }
  };

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
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="text-sm text-gray-500">
          View your activity and notifications on the platform.
        </p>
      </div>

      {/* Notifications Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500">
            All your notifications and activity updates
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                  !notification.isRead ? "bg-blue-50/30" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      notification.avatar ||
                      "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=default"
                    }
                    alt={notification.title}
                    className="w-12 h-12 rounded-full flex-shrink-0"
                  />
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
            <div className="px-6 py-8 text-center">
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

      {/* Debug Section - Business Privacy Settings */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">
          🔍 Debug: Business Privacy Settings
        </h3>
        <p className="text-xs text-yellow-700 mb-3">
          This section shows your business privacy settings. If your business is
          "private", jobs won't appear in Find Work for other users.
        </p>
        {businesses.length > 0 ? (
          <div className="space-y-2">
            {businesses.map((business) => (
              <div key={business.id} className="text-sm">
                <span className="font-medium">{business.name}:</span>{" "}
                <span
                  className={`font-mono ${
                    business.privacy === "public"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {business.privacy || "public"}
                </span>
                {business.privacy === "private" && (
                  <span className="text-red-600 text-xs ml-2">
                    ⚠️ Jobs from this business won't appear in Find Work
                  </span>
                )}
                {business.privacy === "private" && (
                  <button
                    onClick={() => fixBusinessPrivacy(business.id)}
                    className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Fix: Make Public
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-yellow-700">No businesses found</p>
        )}
        <div className="mt-3 text-xs text-yellow-600">
          💡 To fix: Go to My Business → Settings and change privacy to "Public"
        </div>
      </div>
    </div>
  );
};

export default UserActivity;

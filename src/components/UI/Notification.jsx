import { useRef } from "react";
import { Transition } from "@headlessui/react";
import { useNotification } from "../../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

export default function Notification() {
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const {
    notifications,
    isOpen,
    closeNotificationPanel,
    removeNotification,
    markAsRead,
  } = useNotification();

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
      closeNotificationPanel();
    } else if (notification.type === "job_accepted" && notification.jobId) {
      // Navigate to the job application detail for accepted jobs
      navigate(`/jobs/application/${notification.jobId}`);
      closeNotificationPanel();
    } else if (notification.type === "job_completed" && notification.jobId) {
      // Navigate to the job application detail for completed jobs
      navigate(`/jobs/application/${notification.jobId}`);
      closeNotificationPanel();
    } else if (
      notification.type === "job_auto_closed" &&
      notification.jobId &&
      notification.businessId
    ) {
      // Navigate to the job details page for auto-closed jobs
      navigate(
        `/my-business/${notification.businessId}/job-listings/${notification.jobId}`
      );
      closeNotificationPanel();
    }
  };

  // Handle "View all notifications" click
  const handleViewAllNotifications = () => {
    navigate("/activity");
    closeNotificationPanel();
  };

  return (
    <>
      {/* Notification dropdown positioned relative to viewport */}
      <div
        ref={notificationRef}
        className="fixed top-20 right-1 z-[9999] w-80 sm:w-96"
      >
        <Transition
          show={isOpen}
          enter="transition ease-out duration-300"
          enterFrom="transform opacity-0 scale-95 translate-y-2"
          enterTo="transform opacity-100 scale-100 translate-y-0"
          leave="transition ease-in duration-200"
          leaveFrom="transform opacity-100 scale-100 translate-y-0"
          leaveTo="transform opacity-0 scale-95 translate-y-2"
        >
          <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 border border-gray-200 mx-4">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Notifications
                </h3>
                <button
                  onClick={closeNotificationPanel}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-6 py-4 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 cursor-pointer ${
                      !notification.isRead ? "bg-blue-50/30" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={notification.avatar}
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
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

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={handleViewAllNotifications}
                  className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-indigo-50"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </Transition>
      </div>
    </>
  );
}

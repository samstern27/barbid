import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getDatabase,
  ref,
  onValue,
  update,
  remove,
  get,
} from "firebase/database";

// Notification management context for handling user notifications
// Manages notification state, Firebase synchronization, and auto-read functionality
const NotificationContext = createContext();

// Custom hook to access notification context with error handling
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

// Notification provider component that manages notification state and operations
export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Add a new notification to local state
  // Generates unique ID and sets timestamp automatically
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      isRead: false,
      ...notification,
    };

    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  // Mark a single notification as read in Firebase and local state
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!currentUser?.uid) return;

      try {
        const db = getDatabase();
        const notificationRef = ref(
          db,
          `users/${currentUser.uid}/notifications/${notificationId}`
        );
        await update(notificationRef, { isRead: true });
      } catch (error) {
        // Silent error handling for production
      }

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [currentUser?.uid]
  );

  // Mark all notifications as read in Firebase and local state
  const markAllAsRead = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      const db = getDatabase();
      const notificationsRef = ref(
        db,
        `users/${currentUser.uid}/notifications`
      );

      // Get all notifications and mark them as read
      const notificationsSnapshot = await get(
        ref(db, `users/${currentUser.uid}/notifications`)
      );
      if (notificationsSnapshot.exists()) {
        const updates = {};
        Object.keys(notificationsSnapshot.val()).forEach((notificationId) => {
          updates[`${notificationId}/isRead`] = true;
        });
        await update(notificationsRef, updates);
      }
    } catch (error) {
      // Silent error handling for production
    }

    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  }, [currentUser?.uid]);

  // Remove a notification from Firebase and local state
  // Updates unread count if notification was unread
  const removeNotification = useCallback(
    async (notificationId) => {
      if (!currentUser?.uid) return;

      try {
        const db = getDatabase();
        const notificationRef = ref(
          db,
          `users/${currentUser.uid}/notifications/${notificationId}`
        );
        await remove(notificationRef);
      } catch (error) {
        // Silent error handling for production
      }

      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== notificationId);
      });
    },
    [currentUser?.uid]
  );

  // Clear all notifications from Firebase and local state
  const clearAllNotifications = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      const db = getDatabase();
      const notificationsRef = ref(
        db,
        `users/${currentUser.uid}/notifications`
      );
      await remove(notificationsRef);
    } catch (error) {
      // Silent error handling for production
    }

    setNotifications([]);
    setUnreadCount(0);
  }, [currentUser?.uid]);

  // Toggle notification panel open/closed state
  const toggleNotificationPanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Close notification panel
  const closeNotificationPanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Auto-mark notifications as read when panel is opened
  // Provides better UX by clearing unread status on interaction
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  }, [isOpen, unreadCount, markAllAsRead]);

  // Load notifications from Firebase when user is authenticated
  // Handles timestamp validation and sorting
  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const db = getDatabase();
    const notificationsRef = ref(db, `users/${currentUser.uid}/notifications`);

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        const notificationsArray = Object.entries(notificationsData).map(
          ([id, notification]) => {
            // Validate timestamp and provide fallback
            let validTimestamp;
            if (notification.timestamp) {
              const parsedTimestamp = new Date(notification.timestamp);
              validTimestamp = isNaN(parsedTimestamp.getTime())
                ? new Date()
                : parsedTimestamp;
            } else {
              validTimestamp = new Date();
            }

            return {
              id,
              ...notification,
              timestamp: validTimestamp,
            };
          }
        );

        // Filter out invalid notifications and sort by timestamp (newest first)
        const validNotifications = notificationsArray.filter(
          (notification) =>
            notification.title &&
            notification.message &&
            notification.timestamp &&
            !isNaN(notification.timestamp.getTime())
        );

        const sortedNotifications = validNotifications.sort(
          (a, b) => b.timestamp - a.timestamp
        );

        setNotifications(sortedNotifications);
        setUnreadCount(sortedNotifications.filter((n) => !n.isRead).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Context value object containing notification state and operations
  const value = {
    notifications,
    unreadCount,
    isOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    toggleNotificationPanel,
    closeNotificationPanel,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

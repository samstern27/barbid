import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { getDatabase, ref, onValue, get } from "firebase/database";
import jobAutoCloseService from "../services/JobAutoCloseService";

// Job management context for handling public job listings and status management
// Manages job filtering, selection, and automatic closure service
const JobContext = createContext();

// Custom hook to access job context with error handling
export const useJob = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJob must be used within a JobProvider");
  }
  return context;
};

// Job provider component that manages job state and auto-close service
export const JobProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [publicJobs, setPublicJobs] = useState([]);
  const [closedJobs, setClosedJobs] = useState([]);
  const [filledJobs, setFilledJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to public jobs updates from Firebase
  // Filters jobs by status and handles business privacy settings
  useEffect(() => {
    if (!currentUser?.uid) {
      setPublicJobs([]);
      setClosedJobs([]);
      setFilledJobs([]);
      return;
    }

    const db = getDatabase();
    const publicJobsRef = ref(db, "public/jobs");

    const unsubscribe = onValue(publicJobsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const jobsArray = Object.keys(data).map((id) => ({
          id,
          ...data[id],
        }));

        // Use business privacy stored directly in job data
        const jobsWithPrivacy = jobsArray.map((job) => {
          // If the job already has businessPrivacy stored, use it
          if (job.businessPrivacy) {
            return job;
          }

          // If no businessPrivacy is stored, assume it's public (show the job)
          // This ensures backward compatibility with existing jobs
          return { ...job, businessPrivacy: "public" };
        });

        // Filter jobs by status for different views
        const openArray = jobsWithPrivacy.filter(
          (job) => job.status === "Open"
        );
        const closedArray = jobsWithPrivacy.filter(
          (job) => job.status === "Closed"
        );
        const filledArray = jobsWithPrivacy.filter(
          (job) => job.status === "Filled"
        );
        setPublicJobs(openArray);
        setClosedJobs(closedArray);
        setFilledJobs(filledArray);
      } else {
        setPublicJobs([]);
        setClosedJobs([]);
        setFilledJobs([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Set up automatic job closure service for the current user
  // Starts service when user is authenticated, stops on unmount
  useEffect(() => {
    if (!currentUser?.uid) return;

    // Start the auto-close service
    jobAutoCloseService.start();

    // Cleanup service on unmount
    return () => {
      jobAutoCloseService.stop();
    };
  }, [currentUser?.uid]);

  // Select a job by ID for detailed view
  const selectJobById = (jobId) => {
    setSelectedJob(jobId);
  };

  // Clear selected job
  const clearSelectedJob = () => {
    setSelectedJob(null);
  };

  // Context value object containing job state and service methods
  // Memoized to prevent unnecessary re-renders of consuming components
  const value = useMemo(() => ({
    publicJobs,
    closedJobs,
    filledJobs,
    selectedJob,
    loading,
    selectJobById,
    clearSelectedJob,
    // Expose service methods for manual control if needed
    jobAutoCloseService: {
      manualCheck: () => jobAutoCloseService.manualCheck(),
      getStatus: () => jobAutoCloseService.getStatus(),
      start: () => jobAutoCloseService.start(),
      stop: () => jobAutoCloseService.stop(),
    },
  }), [publicJobs, closedJobs, filledJobs, selectedJob, loading]);

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

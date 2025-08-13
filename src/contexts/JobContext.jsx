import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getDatabase, ref, onValue } from "firebase/database";
import jobAutoCloseService from "../services/JobAutoCloseService";

const JobContext = createContext();

export const useJob = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJob must be used within a JobProvider");
  }
  return context;
};

export const JobProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [publicJobs, setPublicJobs] = useState([]);
  const [closedJobs, setClosedJobs] = useState([]);
  const [filledJobs, setFilledJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to jobs updates
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
        const openArray = jobsArray.filter((job) => job.status === "Open");
        const closedArray = jobsArray.filter((job) => job.status === "Closed");
        const filledArray = jobsArray.filter((job) => job.status === "Filled");
        setPublicJobs(jobsArray); // Show all jobs, let UI handle filtering
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

  // Set up automatic job closure service
  useEffect(() => {
    if (!currentUser?.uid) return;

    // Start the auto-close service
    jobAutoCloseService.start();

    // Cleanup service on unmount
    return () => {
      jobAutoCloseService.stop();
    };
  }, [currentUser?.uid]);

  // Select a job by ID
  const selectJobById = (jobId) => {
    setSelectedJob(jobId);
  };

  // Clear selected job
  const clearSelectedJob = () => {
    setSelectedJob(null);
  };

  const value = {
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
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

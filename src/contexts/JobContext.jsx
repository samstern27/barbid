import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getDatabase, ref, onValue } from "firebase/database";

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
  const [loading, setLoading] = useState(true);

  // Subscribe to public jobs updates
  useEffect(() => {
    if (!currentUser?.uid) {
      setPublicJobs([]);
      setLoading(false);
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
        setPublicJobs(jobsArray);
      } else {
        setPublicJobs([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const value = {
    publicJobs,
    loading,
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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

const BusinessContext = createContext();

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
};

export const BusinessProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all businesses for the current user
  useEffect(() => {
    if (!currentUser?.uid) {
      setBusinesses([]);
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const businessesRef = ref(db, `users/${currentUser.uid}/business`);

    const unsubscribe = onValue(businessesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const businessesArray = Object.keys(data).map((id) => ({
          id,
          ...data[id],
        }));
        setBusinesses(businessesArray);

        // If no business is selected and we have businesses, select the first one
        if (!selectedBusiness && businessesArray.length > 0) {
          setSelectedBusiness(businessesArray[0]);
        }

        // Update selected business with latest data if it exists
        if (selectedBusiness) {
          const updatedBusiness = businessesArray.find(
            (b) => b.id === selectedBusiness.id
          );
          if (updatedBusiness) {
            setSelectedBusiness(updatedBusiness);
          }
        }
      } else {
        setBusinesses([]);
        setSelectedBusiness(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Select a business
  const selectBusiness = (business) => {
    setSelectedBusiness(business);
  };

  // Select a business by ID
  const selectBusinessById = useCallback(
    (businessId) => {
      const business = businesses.find((b) => b.id === businessId);
      if (business) {
        setSelectedBusiness(business);
      }
    },
    [businesses]
  );

  // Clear selected business
  const clearSelectedBusiness = () => {
    setSelectedBusiness(null);
  };

  // Auto-select business based on URL if available
  useEffect(() => {
    const pathname = window.location.pathname;
    const businessMatch = pathname.match(/\/my-business\/([^\/]+)/);
    if (businessMatch && businesses.length > 0) {
      const businessId = businessMatch[1];
      const business = businesses.find((b) => b.id === businessId);
      if (
        business &&
        (!selectedBusiness || selectedBusiness.id !== businessId)
      ) {
        setSelectedBusiness(business);
      }
    }
  }, [businesses, selectedBusiness]);

  // Update a job
  const updateJob = async (jobId, updatedJobData) => {
    if (!currentUser?.uid || !selectedBusiness?.id) {
      throw new Error("User or business not found");
    }

    const db = getDatabase();
    const jobRef = ref(
      db,
      `users/${currentUser.uid}/business/${selectedBusiness.id}/jobs/${jobId}`
    );

    const publicJobRef = ref(db, `public/jobs/${jobId}`);

    try {
      await update(jobRef, updatedJobData);
      await update(publicJobRef, updatedJobData);

      // Update local state
      if (selectedBusiness.jobs) {
        const updatedJobs = {
          ...selectedBusiness.jobs,
          [jobId]: updatedJobData,
        };
        setSelectedBusiness({
          ...selectedBusiness,
          jobs: updatedJobs,
        });
      }
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    }
  };

  // Delete a job
  const deleteJob = async (jobId) => {
    if (!currentUser?.uid || !selectedBusiness?.id) {
      throw new Error("User or business not found");
    }

    const db = getDatabase();
    const jobRef = ref(
      db,
      `users/${currentUser.uid}/business/${selectedBusiness.id}/jobs/${jobId}`
    );

    const publicJobRef = ref(db, `public/jobs/${jobId}`);

    try {
      await remove(jobRef);
      await remove(publicJobRef);

      // Count remaining jobs and update jobListings
      const jobsRef = ref(
        db,
        `users/${currentUser.uid}/business/${selectedBusiness.id}/jobs`
      );
      const jobsSnapshot = await get(jobsRef);
      const jobsCount = jobsSnapshot.exists()
        ? Object.keys(jobsSnapshot.val()).length
        : 0;

      const businessRef = ref(
        db,
        `users/${currentUser.uid}/business/${selectedBusiness.id}`
      );
      await update(businessRef, {
        jobListings: jobsCount,
      });

      // Also update the public business jobListings count
      const publicBusinessRef = ref(
        db,
        `public/businesses/${selectedBusiness.id}`
      );
      try {
        await update(publicBusinessRef, {
          jobListings: jobsCount,
        });
      } catch (error) {
        console.log("Public business reference not found, skipping update");
      }

      // Update local state after successful deletion
      if (selectedBusiness.jobs) {
        const { [jobId]: deletedJob, ...remainingJobs } = selectedBusiness.jobs;
        setSelectedBusiness({
          ...selectedBusiness,
          jobs: remainingJobs,
        });
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  };

  const value = {
    selectedBusiness,
    businesses,
    loading,
    selectBusiness,
    selectBusinessById,
    clearSelectedBusiness,
    updateJob,
    deleteJob,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};

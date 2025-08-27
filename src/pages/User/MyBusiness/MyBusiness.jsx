import React from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { useState, useEffect } from "react";

import EmptyState from "../../../components/User/MyBusiness/EmptyState";
import BusinessTable from "../../../components/User/MyBusiness/BusinessTable";
import CreateBusiness from "../../../components/User/MyBusiness/CreateBusiness";
import Breadcrumb from "../../../components/UI/Breadcrumb";
import { useAuth } from "../../../contexts/AuthContext";
import Heading from "../../../components/User/MyBusiness/Heading";
import Loader from "../../../components/UI/Loader";

// Main MyBusiness page component for managing user businesses
// Features business listing, creation, and empty state handling
const MyBusiness = () => {
  // Authentication and business state management
  const { currentUser } = useAuth();
  const [businesses, setBusinesses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createBusinessOpen, setCreateBusinessOpen] = useState(false);

  // Fetch all businesses from Firebase for the current user
  // Transforms Firebase object structure to array format
  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const businessRef = ref(db, "users/" + currentUser?.uid + "/business");
    onValue(businessRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Transform Firebase object structure to array with IDs
        const businessArray = Object.entries(data)
          .map(([id, business]) => ({
            id,
            businessId: id, // Keep both for compatibility
            ...business,
          }))
          .filter((business) => business && business.name); // Filter out invalid businesses
        setBusinesses(businessArray);
      } else {
        setBusinesses([]);
      }
      setLoading(false);
    });
  }, [currentUser]);

  // Breadcrumb navigation configuration
  const pages = [{ name: "Businesses", href: "#", current: true }];

  return (
    <div className="flex flex-col m-10 gap-4">
      {/* Navigation breadcrumb */}
      <Breadcrumb pages={pages} />
      
      {/* Page heading with create business button */}
      <Heading
        createBusinessOpen={createBusinessOpen}
        setCreateBusinessOpen={setCreateBusinessOpen}
      />

      {/* Conditional rendering based on loading and business state */}
      {loading ? (
        /* Loading state with spinner */
        <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
          <Loader
            size="2xl"
            text="Loading your businesses..."
            className="min-h-[60vh]"
          />
        </div>
      ) : businesses && businesses.length > 0 ? (
        /* Business table when businesses exist */
        <div className="flex flex-1 flex-col justify-start items-center gap-4 min-h-[60vh]">
          <BusinessTable businesses={businesses} />
        </div>
      ) : (
        /* Empty state when no businesses exist */
        <div className="flex flex-1 flex-col justify-center items-center gap-4 min-h-[60vh]">
          <EmptyState
            createBusinessOpen={createBusinessOpen}
            setCreateBusinessOpen={setCreateBusinessOpen}
          />
        </div>
      )}

      {/* Create business modal component */}
      <CreateBusiness
        createBusinessOpen={createBusinessOpen}
        setCreateBusinessOpen={setCreateBusinessOpen}
      />
    </div>
  );
};

export default MyBusiness;

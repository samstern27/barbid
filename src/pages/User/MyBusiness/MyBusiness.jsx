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

const MyBusiness = () => {
  const { currentUser } = useAuth();
  const [businesses, setBusinesses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createBusinessOpen, setCreateBusinessOpen] = useState(false);
  useEffect(() => {
    const db = getDatabase();
    const businessRef = ref(db, "users/" + currentUser?.uid + "/business");
    onValue(businessRef, (snapshot) => {
      const data = snapshot.val();
      setBusinesses(data);
      setLoading(false);
    });
  }, [currentUser]);

  const pages = [{ name: "Businesses", href: "#", current: true }];
  return (
    <div className="flex flex-col m-10 gap-4">
      <Breadcrumb pages={pages} />
      <Heading
        createBusinessOpen={createBusinessOpen}
        setCreateBusinessOpen={setCreateBusinessOpen}
      />

      {loading ? (
        <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
          <Loader
            size="2xl"
            text="Loading your businesses..."
            className="min-h-[60vh]"
          />
        </div>
      ) : businesses ? (
        <div className="flex flex-1 flex-col justify-start items-center gap-4 min-h-[60vh]">
          <BusinessTable businesses={businesses} />
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-center items-center gap-4 min-h-[60vh]">
          <EmptyState
            createBusinessOpen={createBusinessOpen}
            setCreateBusinessOpen={setCreateBusinessOpen}
          />
        </div>
      )}

      <CreateBusiness
        createBusinessOpen={createBusinessOpen}
        setCreateBusinessOpen={setCreateBusinessOpen}
      />
    </div>
  );
};

export default MyBusiness;

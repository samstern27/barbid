import React from "react";
import Breadcrumb from "../../components/UI/Breadcrumb";

const pages = [{ name: "Activity", href: "/activity", current: true }];

const UserActivity = () => {
  return (
    <div className="flex flex-col m-10 gap-4">
      <Breadcrumb pages={pages} />
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="text-sm text-gray-500">
          View your activity on the platform.
        </p>
      </div>
    </div>
  );
};

export default UserActivity;

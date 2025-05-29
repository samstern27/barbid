import { Outlet } from "react-router-dom";
import UserNavbar from "./UserNavbar";

const UserLayout = () => {
  return (
    <div>
      <UserNavbar />
      <Outlet />
    </div>
  );
};

export default UserLayout;

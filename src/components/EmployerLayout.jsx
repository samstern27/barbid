import { Outlet } from "react-router-dom";
import EmployerNavbar from "./EmployerNavbar";

const EmployerLayout = () => {
  return (
    <div>
      <EmployerNavbar />
      <Outlet />
    </div>
  );
};

export default EmployerLayout;

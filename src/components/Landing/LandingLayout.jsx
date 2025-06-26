import LandingNavbar from "./LandingNavbar";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

const LandingLayout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
export default LandingLayout;

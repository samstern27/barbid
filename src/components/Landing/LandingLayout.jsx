import LandingNavbar from "./LandingNavbar";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

const LandingLayout = () => {
  const location = useLocation();

  // Scroll to top whenever the route changes
  // This ensures users start at the top of each new page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />
      <main className="flex-grow">
        {/* Outlet renders the child route components */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
export default LandingLayout;

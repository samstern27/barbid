import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Landing Pages
import LandingLayout from "./components/Landing/LandingLayout";
import Home from "./pages/Landing/Home";
import HowItWorks from "./pages/Landing/HowItWorks";
import Contact from "./pages/Landing/Contact";
import Login from "./pages/Landing/Login";
import SignUp from "./pages/Landing/SignUp";
import FAQ from "./pages/Landing/FAQ";

// User Pages
import UserLayout from "./components/User/UserLayout";
import UserHome from "./pages/User/UserHome";
import UserProfile from "./pages/User/UserProfile";
import UserJobs from "./pages/User/UserJobs";
import UserFindWork from "./pages/User/UserFindWork";
import UserMyBusiness from "./pages/User/UserMyBusiness";
import UserRoles from "./pages/User/UserRoles";
import UserReviews from "./pages/User/UserReviews";
import UserSettings from "./pages/User/UserSettings";

import "./index.css";

function AppRoutes() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Optionally, replace null with a spinner component
    return null;
  }

  if (currentUser) {
    // LOGGED IN ROUTES (no /user prefix)
    return (
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<UserHome />} />
          <Route path="profile/:id" element={<UserProfile />} />
          <Route path="jobs" element={<UserJobs />} />
          <Route path="find-work" element={<UserFindWork />} />
          <Route path="my-business" element={<UserMyBusiness />} />
          <Route path="roles" element={<UserRoles />} />
          <Route path="reviews" element={<UserReviews />} />
          <Route path="settings" element={<UserSettings />} />
        </Route>
      </Routes>
    );
  } else {
    // LOGGED OUT ROUTES (marketing/landing)
    return (
      <Routes>
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<Home />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>
      </Routes>
    );
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

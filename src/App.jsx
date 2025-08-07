import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BusinessProvider } from "./contexts/BusinessContext";
import { JobProvider } from "./contexts/JobContext";
import { LocationProvider } from "./contexts/LocationContext";

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
import FindWork from "./pages/User/FindWork/FindWork";
import FindWorkJobDetail from "./pages/User/FindWork/FindWorkJobDetail";
import MyBusiness from "./pages/User/MyBusiness/MyBusiness";
import MyBusinessOverview from "./pages/User/MyBusiness/MyBusinessOverview";
import MyBusinessDetailLayout from "./components/User/MyBusiness/MyBusinessDetailLayout";
import MyBusinessJobListings from "./pages/User/MyBusiness/MyBusinessJobListings";
import MyBusinessPastCandidates from "./pages/User/MyBusiness/MyBusinessPastCandidates";
import MyBusinessReviews from "./pages/User/MyBusiness/MyBusinessReviews";
import MyBusinessSettings from "./pages/User/MyBusiness/MyBusinessSettings";
import UserRoles from "./pages/User/UserRoles";
import UserReviews from "./pages/User/UserReviews";
import UserSettings from "./pages/User/UserSettings";
import ViewJob from "./components/User/MyBusiness/ViewJob";
import MyBusinessJobListingsApplicants from "./pages/User/MyBusiness/MyBusinessJobListingsApplicants";
import MyBusinessJobListingsApplicantsDetail from "./pages/User/MyBusiness/MyBusinessJobListingsApplicantsDetail";

import "./index.css";

function AppRoutes() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Optionally, replace null with a spinner component
    return null;
  }

  if (currentUser) {
    // LOGGED IN ROUTES
    return (
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<UserHome />} />
          <Route path="profile/:id" element={<UserProfile />} />
          <Route path="jobs" element={<UserJobs />} />
          <Route path="roles" element={<UserRoles />} />
          <Route path="reviews" element={<UserReviews />} />
          <Route path="settings" element={<UserSettings />} />

          {/* FindWork Routes */}
          <Route
            path="find-work"
            element={
              <JobProvider>
                <FindWork />
              </JobProvider>
            }
          />
          <Route
            path="find-work/:jobId"
            element={
              <JobProvider>
                <FindWorkJobDetail />
              </JobProvider>
            }
          />

          {/* MyBusiness Routes */}
          <Route
            path="my-business"
            element={
              <BusinessProvider>
                <MyBusiness />
              </BusinessProvider>
            }
          />
          <Route
            path="my-business/:businessId"
            element={
              <BusinessProvider>
                <MyBusinessDetailLayout />
              </BusinessProvider>
            }
          >
            {/* Main Business Pages */}
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<MyBusinessOverview />} />
            <Route path="reviews" element={<MyBusinessReviews />} />
            <Route path="settings" element={<MyBusinessSettings />} />
            <Route
              path="past-candidates"
              element={<MyBusinessPastCandidates />}
            />

            {/* Job Management Routes */}
            <Route path="job-listings" element={<MyBusinessJobListings />} />
            <Route path="job-listings/:jobId" element={<ViewJob />} />
            <Route
              path="job-listings/:jobId/applicants"
              element={<MyBusinessJobListingsApplicants />}
            />
            <Route
              path="job-listings/:jobId/applicants/:applicantUsername"
              element={<MyBusinessJobListingsApplicantsDetail />}
            />
          </Route>
        </Route>
      </Routes>
    );
  } else {
    // LOGGED OUT ROUTES
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
        <LocationProvider>
          <AppRoutes />
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

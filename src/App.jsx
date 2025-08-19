import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BusinessProvider } from "./contexts/BusinessContext";
import { JobProvider } from "./contexts/JobContext";
import { LocationProvider } from "./contexts/LocationContext";
import { NotificationProvider } from "./contexts/NotificationContext";

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
import MyJobsLayout from "./pages/User/MyJobs/MyJobsLayout";
import MyJobsOverview from "./pages/User/MyJobs/MyJobsOverview";
import MyJobsActive from "./pages/User/MyJobs/MyJobsActive";
import MyJobsAccepted from "./pages/User/MyJobs/MyJobsAccepted";
import MyJobsRejected from "./pages/User/MyJobs/MyJobsRejected";
import MyJobApplicationDetail from "./pages/User/MyJobs/MyJobApplicationDetail";

// FindWork Pages
import FindWork from "./pages/User/FindWork/FindWork";
import FindWorkJobDetail from "./pages/User/FindWork/FindWorkJobDetail";

// MyBusiness Pages
import MyBusiness from "./pages/User/MyBusiness/MyBusiness";
import MyBusinessDetailLayout from "./components/User/MyBusiness/MyBusinessDetailLayout";
import MyBusinessOverview from "./pages/User/MyBusiness/MyBusinessOverview";
import MyBusinessJobListings from "./pages/User/MyBusiness/MyBusinessJobListings";
import MyBusinessJobListingsDetail from "./components/User/MyBusiness/MyBusinessJobListingsDetail";
import MyBusinessJobListingsApplicants from "./pages/User/MyBusiness/MyBusinessJobListingsApplicants";
import MyBusinessJobListingsApplicantsDetail from "./pages/User/MyBusiness/MyBusinessJobListingsApplicantsDetail";
import MyBusinessPreviousStaff from "./pages/User/MyBusiness/MyBusinessPreviousStaff";
import MyBusinessPreviousStaffDetail from "./pages/User/MyBusiness/MyBusinessPreviousStaffDetail";
import MyBusinessSettings from "./pages/User/MyBusiness/MyBusinessSettings";

import UserActivity from "./pages/User/UserActivity";
import UserSettings from "./pages/User/UserSettings";

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
          <Route path="profile/:username" element={<UserProfile />} />
          <Route path="jobs" element={<MyJobsLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<MyJobsOverview />} />
            <Route path="active" element={<MyJobsActive />} />
            <Route path="accepted" element={<MyJobsAccepted />} />
            <Route path="rejected" element={<MyJobsRejected />} />
            <Route
              path="application/:jobId"
              element={<MyJobApplicationDetail />}
            />
          </Route>

          <Route path="activity" element={<UserActivity />} />
          <Route path="settings" element={<UserSettings />} />

          {/* FindWork Routes */}
          <Route path="find-work" element={<FindWork />} />
          <Route path="find-work/:jobId" element={<FindWorkJobDetail />} />

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
            <Route path="job-listings" element={<MyBusinessJobListings />} />
            <Route
              path="job-listings/:jobId"
              element={<MyBusinessJobListingsDetail />}
            />
            <Route
              path="job-listings/:jobId/applicants"
              element={<MyBusinessJobListingsApplicants />}
            />
            <Route
              path="job-listings/:jobId/applicants/:applicationId"
              element={<MyBusinessJobListingsApplicantsDetail />}
            />

            {/* Previous Staff Routes */}
            <Route
              path="previous-staff"
              element={<MyBusinessPreviousStaff />}
            />
            <Route
              path="previous-staff/:shiftId"
              element={<MyBusinessPreviousStaffDetail />}
            />
            <Route path="settings" element={<MyBusinessSettings />} />
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
        </Route>
        {/* Catch all other routes and redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

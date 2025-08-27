import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BusinessProvider } from "./contexts/BusinessContext";
import { JobProvider } from "./contexts/JobContext";
import { LocationProvider } from "./contexts/LocationContext";
import { NotificationProvider } from "./contexts/NotificationContext";

// Landing Pages - Public-facing routes for unauthenticated users
import LandingLayout from "./components/Landing/LandingLayout";
import Home from "./pages/Landing/Home";
import HowItWorks from "./pages/Landing/HowItWorks";
import Contact from "./pages/Landing/Contact";
import Login from "./pages/Landing/Login";
import SignUp from "./pages/Landing/SignUp";
import FAQ from "./pages/Landing/FAQ";
import ForgotPassword from "./pages/Landing/ForgotPassword";
import EmailVerification from "./pages/Landing/EmailVerification";

// User Pages - Protected routes for authenticated users
import UserLayout from "./components/User/UserLayout";
import UserHome from "./pages/User/UserHome";
import UserProfile from "./pages/User/UserProfile";
import MyJobsLayout from "./pages/User/MyJobs/MyJobsLayout";

import MyJobsActive from "./pages/User/MyJobs/MyJobsActive";
import MyJobsAccepted from "./pages/User/MyJobs/MyJobsAccepted";
import MyJobsRejected from "./pages/User/MyJobs/MyJobsRejected";
import MyJobApplicationDetail from "./pages/User/MyJobs/MyJobApplicationDetail";

// FindWork Pages - Job discovery and application system
import FindWork from "./pages/User/FindWork/FindWork";
import FindWorkJobDetail from "./pages/User/FindWork/FindWorkJobDetail";

// MyBusiness Pages - Business management and job posting system
import MyBusiness from "./pages/User/MyBusiness/MyBusiness";
import MyBusinessDetailLayout from "./components/User/MyBusiness/MyBusinessDetailLayout";

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

// Main routing component that handles authentication-based navigation
// Provides different route sets based on user authentication status
function AppRoutes() {
  const { currentUser, loading } = useAuth();

  // Authentication state determines routing - verified users get full access
  if (loading) {
    // Optionally, replace null with a spinner component
    return null;
  }

  if (currentUser) {
    // Check if user's email is verified
    if (!currentUser.emailVerified) {
      // Redirect unverified users to a verification page
      return (
        <Routes>
          <Route path="/" element={<LandingLayout />}>
            <Route index element={<Navigate to="/verify-email" replace />} />
            <Route path="verify-email" element={<EmailVerification />} />
          </Route>
          <Route path="*" element={<Navigate to="/verify-email" replace />} />
        </Routes>
      );
    }

    // LOGGED IN ROUTES (only for verified users)
    // Full application access with user dashboard and business management
    return (
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<UserHome />} />
          <Route path="profile/:username" element={<UserProfile />} />

          {/* Job management routes with nested navigation */}
          <Route path="jobs" element={<MyJobsLayout />}>
            <Route index element={<Navigate to="active" replace />} />
            <Route path="active" element={<MyJobsActive />} />
            <Route path="accepted" element={<MyJobsAccepted />} />
            <Route path="rejected" element={<MyJobsRejected />} />
            <Route
              path="application/:jobId"
              element={<MyJobApplicationDetail />}
            />
          </Route>

          {/* User activity tracking with business context */}
          <Route
            path="activity"
            element={
              <BusinessProvider>
                <UserActivity />
              </BusinessProvider>
            }
          />
          <Route path="settings" element={<UserSettings />} />

          {/* Job discovery and application system */}
          <Route path="find-work" element={<FindWork />} />
          <Route path="find-work/:jobId" element={<FindWorkJobDetail />} />

          {/* Business management system with nested routing */}
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
            <Route index element={<Navigate to="job-listings" replace />} />
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
    // Public landing pages for unauthenticated users
    return (
      <Routes>
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<Home />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>
        {/* Catch all other routes and redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }
}

// Main App component with context providers and routing setup
// Wraps the entire application with necessary providers for state management
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

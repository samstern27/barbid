import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import LandingLayout from "./components/LandingLayout";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs/Jobs";
import JobDetails from "./pages/Jobs/JobsDetails";
import HowItWorks from "./pages/HowItWorks";
import EmployerProfile from "./pages/Employer/EmployerProfile";
import PublicEmployerProfile from "./pages/Employer/PublicEmployerProfile";
import UserProfile from "./pages/User/UserProfile";
import PublicUserProfile from "./pages/User/PublicUserProfile";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import FAQ from "./pages/FAQ";
import EmployerDashboard from "./pages/Employer/EmployerDashboard";
import UserDashboard from "./pages/User/UserDashboard";
import EmployerLayout from "./components/EmployerLayout";
import UserLayout from "./components/UserLayout";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingLayout />}>
            <Route index element={<Home />} />
            <Route path="how-it-works" element={<HowItWorks />} />
            <Route path="contact" element={<Contact />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetails />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="employer" element={<EmployerProfile />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="employer/:id" element={<PublicEmployerProfile />} />
            <Route path="profile/:id" element={<PublicUserProfile />} />
          </Route>
          <Route path="/employer" element={<EmployerLayout />}>
            <Route path="dashboard" element={<EmployerDashboard />} />
            <Route path="profile" element={<EmployerProfile />} />
          </Route>
          <Route path="/user" element={<UserLayout />}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

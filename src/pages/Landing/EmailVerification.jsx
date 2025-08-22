import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import Alert from "../../UI components/Alert";

const EmailVerification = () => {
  const { currentUser, resendVerificationEmail, logout, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkingVerification, setCheckingVerification] = useState(false);
  const navigate = useNavigate();

  // Check if user is verified and redirect if so
  useEffect(() => {
    if (currentUser?.emailVerified) {
      navigate("/", { replace: true });
    }
  }, [currentUser?.emailVerified, navigate]);

  const handleResendVerification = async () => {
    try {
      setError("");
      setLoading(true);
      await resendVerificationEmail();
      setSuccess("Verification email sent successfully! Check your inbox.");
    } catch (error) {
      setError(error.message || "Failed to send verification email");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setCheckingVerification(true);
      setError("");
      
      // Refresh the user to get the latest verification status
      await refreshUser();
      
      // Check if verification is now complete
      if (currentUser.emailVerified) {
        setSuccess("Email verified! Redirecting you to the site...");
        // Small delay to show success message
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
      } else {
        setError("Email not verified yet. Please check your inbox and click the verification link.");
      }
    } catch (error) {
      setError("Failed to check verification status. Please try again.");
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-yellow-500">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification link to{" "}
            <strong>{currentUser?.email}</strong>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Please check your email and click the verification link to access
            your account.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> You won't be able to access the site
                until you verify your email address.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleCheckVerification}
            disabled={checkingVerification}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkingVerification ? "Checking..." : "I've Verified My Email"}
          </button>

          <button
            onClick={handleResendVerification}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Resend verification email"}
          </button>
          
          <div className="flex gap-3">
            <NavLink
              to="/signup"
              className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Use Different Email
            </NavLink>
            
            <button
              onClick={handleLogout}
              className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <NavLink
              to="/contact"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Contact support
            </NavLink>
          </p>
        </div>

        {/* Error and success messages */}
        {error && <Alert type="danger" message={error} />}
        {success && <Alert type="success" message={success} />}
      </div>
    </div>
  );
};

export default EmailVerification;

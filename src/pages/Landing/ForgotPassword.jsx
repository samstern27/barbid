import React, { useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { sendPasswordResetEmailToUser } from "../../firebase/firebase";
import Alert from "../../UI components/Alert";

// Forgot password page for users who need to reset their password
// Features email input, Firebase password reset, and success state management
const ForgotPassword = () => {
  // Form input reference and state management
  const emailRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle form submission to send password reset email
  // Uses Firebase authentication service for password reset
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await sendPasswordResetEmailToUser(emailRef.current.value);
      setSuccess(true);
    } catch (error) {
      setError(error.message || "Failed to send password reset email");
    } finally {
      setLoading(false);
    }
  };

  // Success state view - shows confirmation and next steps
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Success icon and message */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-500">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a password reset link to{" "}
              <strong>{emailRef.current?.value}</strong>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Click the link in your email to reset your password.
            </p>
          </div>
          
          {/* Action buttons for success state */}
          <div className="mt-8 space-y-4">
            <NavLink
              to="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Login
            </NavLink>
            <button
              onClick={() => setSuccess(false)}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Send another email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main form view - password reset request form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header section */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>
        
        {/* Password reset form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Email input field */}
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              ref={emailRef}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </div>

          {/* Back to login link */}
          <div className="text-center">
            <NavLink
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to Login
            </NavLink>
          </div>
        </form>

        {/* Error message display */}
        {error && <Alert type="danger" message={error} />}
      </div>
    </div>
  );
};

export default ForgotPassword;

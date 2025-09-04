import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Alert from "../../UI components/Alert";
import "../../index.css";
import { auth } from "../../firebase/firebase";
import { writeUserData } from "../../firebase/firebase";
import { NavLink, useNavigate } from "react-router-dom";

// SignUp page component for user registration
// Features form validation, age verification, email verification, and social sign-in options
const SignUp = () => {
  // Form input references for controlled form handling
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const numberRef = useRef(null);
  const passwordRef = useRef(null);
  const cpasswordRef = useRef(null);
  const dateOfBirthRef = useRef(null);

  // Authentication context and state management
  const { signup, signInWithGoogle, currentUser } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const navigate = useNavigate();

  // Redirect authenticated users to home page
  useEffect(() => {
    if (currentUser) {
      navigate("/", { replace: true });
    }
  }, [currentUser, navigate]);

  // Handle form submission with validation and user creation
  // Includes password confirmation, age verification, and Firebase signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password confirmation
    if (passwordRef.current.value !== cpasswordRef.current.value) {
      return setError("Passwords do not match");
    }

    // Check age before proceeding (must be 18+)
    const dateOfBirth = dateOfBirthRef.current.value;
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age =
        today.getFullYear() -
        birthDate.getFullYear() -
        (today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
          today.getDate() < birthDate.getDate())
          ? 1
          : 0);

      if (age < 18) {
        setError("You must be 18 or older to create an account");
        return;
      }
    }

    try {
      setError("");
      setLoading(true);
      const displayName = `${firstNameRef.current.value} ${lastNameRef.current.value}`;

      const result = await signup(
        emailRef.current.value,
        passwordRef.current.value,
        displayName,
        numberRef.current.value || null,
        dateOfBirthRef.current.value || null
      );

      // Show email verification message if required
      if (result.needsVerification) {
        setVerificationEmail(emailRef.current.value);
        setShowVerificationMessage(true);
      }
    } catch (error) {
      setError(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth sign-in
  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      const user = await signInWithGoogle();
    } catch (error) {
      setError(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  // Apple Sign-In handler (placeholder for future implementation)
  const handleAppleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      // TODO: Implement Apple Sign-In functionality
      setError("Apple Sign-In is not yet implemented");
    } catch (error) {
      setError(error.message || "Failed to sign in with Apple");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header section with gradient background */}
      <div className="text-center bg-gradient-to-r from-indigo-600 to-indigo-600 min-h-[180px] sm:p-6 p-4">
        <h4 className="sm:text-3xl text-2xl text-white font-medium mt-3">
          Create your free account
        </h4>
      </div>

      {/* Email verification success message */}
      {showVerificationMessage ? (
        <div className="mx-4 mb-4 -mt-20">
          <div className="max-w-4xl mx-auto bg-white [box-shadow:0_2px_13px_-6px_rgba(0,0,0,0.4)] sm:p-8 p-4 rounded-md text-center">
            {/* Success icon */}
            <div className="mb-6">
              <svg
                className="mx-auto h-12 w-12 text-green-500"
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

            {/* Verification instructions */}
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Check your email
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We've sent a verification link to{" "}
              <strong>{verificationEmail}</strong>
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Please click the link in your email to verify your account before
              you can sign in.
            </p>

            {/* Important note about email verification */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You won't be able to access the site
                until you verify your email address.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <NavLink
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Login
              </NavLink>
              <button
                onClick={() => setShowVerificationMessage(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Sign Up
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Registration form */
        <div className="mx-4 mb-4 -mt-20">
          <form
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto bg-white [box-shadow:0_2px_13px_-6px_rgba(0,0,0,0.4)] sm:p-8 p-4 rounded-md"
          >
            {/* Form fields in responsive grid layout */}
            <div className="grid sm:grid-cols-2 gap-8">
              {/* First Name field */}
              <div>
                <label
                  htmlFor="name"
                  className="text-slate-800 text-sm font-medium mb-2 block"
                >
                  First Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="bg-slate-100 focus:bg-transparent w-full text-sm text-slate-800 px-4 py-2.5 rounded-sm border border-gray-200 focus:border-indigo-600 outline-0 transition-all"
                  placeholder="Enter name"
                  required
                  ref={firstNameRef}
                />
              </div>

              {/* Last Name field */}
              <div>
                <label
                  htmlFor="lname"
                  className="text-slate-800 text-sm font-medium mb-2 block"
                >
                  Last Name *
                </label>
                <input
                  id="lname"
                  name="lname"
                  type="text"
                  className="bg-slate-100 focus:bg-transparent w-full text-sm text-slate-800 px-4 py-2.5 rounded-sm border border-gray-200 focus:border-indigo-600 outline-0 transition-all"
                  placeholder="Enter last name"
                  required
                  ref={lastNameRef}
                />
              </div>

              {/* Email field */}
              <div>
                <label
                  htmlFor="email"
                  className="text-slate-800 text-sm font-medium mb-2 block"
                >
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="bg-slate-100 focus:bg-transparent w-full text-sm text-slate-800 px-4 py-2.5 rounded-sm border border-gray-200 focus:border-indigo-600 outline-0 transition-all"
                  placeholder="Enter email"
                  required
                  ref={emailRef}
                />
              </div>

              {/* Mobile number field (optional) */}
              <div>
                <label
                  htmlFor="number"
                  className="text-slate-800 text-sm font-medium mb-2 block"
                >
                  Mobile No. (Optional)
                </label>
                <input
                  id="number"
                  name="number"
                  type="tel"
                  className="bg-slate-100 focus:bg-transparent w-full text-sm text-slate-800 px-4 py-2.5 rounded-sm border border-gray-200 focus:border-indigo-600 outline-0 transition-all"
                  placeholder="Enter mobile number"
                  ref={numberRef}
                />
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="password"
                  className="text-slate-800 text-sm font-medium mb-2 block"
                >
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="bg-slate-100 focus:bg-transparent w-full text-sm text-slate-800 px-4 py-2.5 rounded-sm border border-gray-200 focus:border-indigo-600 outline-0 transition-all"
                  placeholder="Enter password"
                  required
                  ref={passwordRef}
                />
              </div>

              {/* Confirm Password field */}
              <div>
                <label
                  htmlFor="cpassword"
                  className="text-slate-800 text-sm font-medium mb-2 block"
                >
                  Confirm Password *
                </label>
                <input
                  id="cpassword"
                  name="cpassword"
                  type="password"
                  className="bg-slate-100 focus:bg-transparent w-full text-sm text-slate-800 px-4 py-2.5 rounded-sm border border-gray-200 focus:border-indigo-600 outline-0 transition-all"
                  placeholder="Enter confirm password"
                  required
                  ref={cpasswordRef}
                />
              </div>

              {/* Date of Birth field */}
              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="text-slate-800 text-sm font-medium mb-2 block"
                >
                  Date of Birth *
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  className="bg-slate-100 focus:bg-transparent w-full text-sm text-slate-800 px-4 py-2.5 rounded-sm border border-gray-200 focus:border-indigo-600 outline-0 transition-all"
                  required
                  ref={dateOfBirthRef}
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-5 text-sm font-medium tracking-wider rounded-md cursor-pointer text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </div>

            {/* Divider for social sign-in options */}
            <div className="my-6 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
              <p className="mx-4 text-center text-slate-500">Or</p>
            </div>

            {/* Social sign-in buttons */}
            <div className="grid sm:grid-cols-1 gap-6">
              {/* Google OAuth button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full px-4 py-2.5 flex items-center justify-center rounded-md text-slate-900 text-sm font-medium tracking-wider cursor-pointer border-0 outline-0 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22px"
                  fill="#fff"
                  className="inline shrink-0 mr-4"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="#fbbd00"
                    d="M120 256c0-25.367 6.989-49.13 19.131-69.477v-86.308H52.823C18.568 144.703 0 198.922 0 256s18.568 111.297 52.823 155.785h86.308v-86.308C126.989 305.13 120 281.367 120 256z"
                    data-original="#fbbd00"
                  />
                  <path
                    fill="#0f9d58"
                    d="m256 392-60 60 60 60c57.079 0 111.297-18.568 155.785-52.823v-86.216h-86.216C305.044 385.147 281.181 392 256 392z"
                    data-original="#0f9d58"
                  />
                  <path
                    fill="#31aa52"
                    d="m139.131 325.477-86.308 86.308a260.085 260.085 0 0 0 22.158 25.235C123.333 485.371 187.62 512 256 512V392c-49.624 0-93.117-26.72-116.869-66.523z"
                    data-original="#31aa52"
                  />
                  <path
                    fill="#3c79e6"
                    d="M512 256a258.24 258.24 0 0 0-4.192-46.377l-2.251-12.299H256v120h121.452a135.385 135.385 0 0 1-51.884 55.638l86.216 86.216a260.085 260.085 0 0 0 25.235-22.158C485.371 388.667 512 324.38 512 256z"
                    data-original="#3c79e6"
                  />
                  <path
                    fill="#cf2d48"
                    d="m352.167 159.833 10.606 10.606 84.853-84.852-10.606-10.606C388.668 26.629 324.381 0 256 0l-60 60 60 60c36.326 0 70.479 14.146 96.167 39.833z"
                    data-original="#cf2d48"
                  />
                  <path
                    fill="#eb4132"
                    d="M256 120V0C187.62 0 123.333 26.629 74.98 74.98a259.849 259.849 0 0 0-22.158 25.235l86.308 86.308C162.883 146.72 206.376 120 256 120z"
                    data-original="#eb4132"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Login link for existing users */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <NavLink
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
                >
                  Log in
                </NavLink>
              </p>
            </div>

            {/* Error message display */}
            {error && <Alert type="danger" message={error} />}
          </form>
        </div>
      )}
    </div>
  );
};

export default SignUp;

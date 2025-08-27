import { useRef, useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import loginBarImage from "../../assets/images/bar-glow.jpg";
import pintPour from "../../assets/images/pint-pour-3.jpg";
import { NavLink, useNavigate } from "react-router-dom";

// Login page component for user authentication
// Features email/password login, Google OAuth, and comprehensive error handling
const Login = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const { login, signInWithGoogle, currentUser } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect authenticated users to home page
  useEffect(() => {
    if (currentUser) {
      navigate("/", { replace: true });
    }
  }, [currentUser, navigate]);

  // Handle email/password form submission
  // Converts Firebase error codes to user-friendly messages
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
    } catch (error) {
      // Convert Firebase error codes to user-friendly messages
      let userFriendlyError = "Failed to sign in";

      if (error.code === "auth/invalid-credential") {
        userFriendlyError = "Incorrect email or password. Please try again.";
      } else if (error.code === "auth/user-not-found") {
        userFriendlyError = "No account found with this email address.";
      } else if (error.code === "auth/wrong-password") {
        userFriendlyError = "Incorrect password. Please try again.";
      } else if (error.code === "auth/too-many-requests") {
        userFriendlyError =
          "Too many failed attempts. Please wait a moment before trying again.";
      } else if (error.code === "auth/user-disabled") {
        userFriendlyError =
          "This account has been disabled. Please contact support.";
      } else if (error.code === "auth/invalid-email") {
        userFriendlyError = "Please enter a valid email address.";
      } else if (error.message.includes("verify your email")) {
        userFriendlyError = error.message; // Keep the email verification message as is
      } else {
        userFriendlyError = "An unexpected error occurred. Please try again.";
      }

      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth sign-in
  // Provides user-friendly error messages for OAuth-specific issues
  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      // Convert Firebase error codes to user-friendly messages
      let userFriendlyError = "Failed to sign in with Google";

      if (error.code === "auth/popup-closed-by-user") {
        userFriendlyError = "Sign-in was cancelled. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        userFriendlyError =
          "Pop-up was blocked. Please allow pop-ups for this site and try again.";
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        userFriendlyError =
          "An account already exists with this email using a different sign-in method.";
      } else if (error.code === "auth/operation-not-allowed") {
        userFriendlyError =
          "Google sign-in is not enabled. Please contact support.";
      } else if (error.message.includes("already exists")) {
        userFriendlyError = error.message; // Keep the existing message for this case
      } else {
        userFriendlyError = "An unexpected error occurred. Please try again.";
      }

      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-1">
        {/* Left side - Login form */}
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Header section */}
            <div>
              <h2 className="mt-8 text-2xl/9 font-bold tracking-tight text-gray-900">
                Sign in to your account
              </h2>
              <p className="mt-2 text-sm/6 text-gray-500">
                Not a member?{" "}
                <NavLink
                  to="/signup"
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Create an account
                </NavLink>
              </p>
            </div>

            <div className="mt-10">
              <div>
                {/* Email/password login form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email input field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Email address
                    </label>
                    <div className="mt-2">
                      <input
                        ref={emailRef}
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  {/* Password input field */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Password
                    </label>
                    <div className="mt-2">
                      <input
                        ref={passwordRef}
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  {/* Remember me checkbox and forgot password link */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <div className="flex h-6 shrink-0 items-center">
                        <div className="group grid size-4 grid-cols-1">
                          <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                          />
                          <svg
                            fill="none"
                            viewBox="0 0 14 14"
                            className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                          >
                            <path
                              d="M3 8L6 11L11 3.5"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-has-checked:opacity-100"
                            />
                            <path
                              d="M3 7H11"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="opacity-0 group-has-indeterminate:opacity-100"
                            />
                          </svg>
                        </div>
                      </div>
                      <label
                        htmlFor="remember-me"
                        className="block text-sm/6 text-gray-900"
                      >
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm/6">
                      <NavLink
                        to="/forgot-password"
                        className="font-semibold text-indigo-600 hover:text-indigo-500"
                      >
                        Forgot password?
                      </NavLink>
                    </div>
                  </div>

                  {/* Submit button */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Signing in..." : "Sign in"}
                    </button>
                  </div>
                </form>

                {/* Error message display */}
                {error && (
                  <div className="mt-4 text-sm text-red-600 text-center">
                    {error}
                  </div>
                )}
              </div>

              {/* Social login section */}
              <div className="mt-10">
                {/* Divider with "Or continue with" text */}
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center"
                  >
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm/6 font-medium">
                    <span className="bg-white px-6 text-gray-900">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google OAuth button */}
                <div className="mt-6 grid grid-cols-1 gap-4">
                  <button
                    onClick={handleGoogleSignIn}
                    className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus-visible:ring-transparent"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      <path
                        d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                        fill="#EA4335"
                      />
                      <path
                        d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                        fill="#34A853"
                      />
                    </svg>
                    <span className="text-sm/6 font-semibold">Google</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Background image (hidden on mobile) */}
        <div className="relative hidden w-0 flex-1 lg:block">
          <img
            alt=""
            src={pintPour}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      </div>
    </>
  );
};

export default Login;

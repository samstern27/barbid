import React, { useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Alert from "../UI components/Alert";
import "../index.css";
import { auth } from "../firebase/firebase";
import { writeUserData } from "../firebase/firebase";

const SignUp = () => {
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const numberRef = useRef(null);
  const passwordRef = useRef(null);
  const cpasswordRef = useRef(null);
  const profileRef = useRef(null);
  const { signup, signInWithGoogle, signInWithApple, currentUser } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("jobseeker");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordRef.current.value !== cpasswordRef.current.value) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);
      const displayName = `${firstNameRef.current.value} ${lastNameRef.current.value}`;

      await signup(
        emailRef.current.value,
        passwordRef.current.value,
        displayName,
        profileRef.current.value,
        numberRef.current.value
      );
    } catch (error) {
      setError(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

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

  const handleAppleSignIn = async () => {
    try {
      setError("");
      setLoading(true);
      const user = await signInWithApple();
    } catch (error) {
      setError(error.message || "Failed to sign in with Apple");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center bg-gradient-to-r from-blue-800 to-blue-400 min-h-[180px] sm:p-6 p-4">
        <h4 className="sm:text-3xl text-2xl text-white font-medium mt-3">
          Create your free account
        </h4>
      </div>

      <div className="mx-4 mb-4 -mt-20">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto bg-white [box-shadow:0_2px_13px_-6px_rgba(0,0,0,0.4)] sm:p-8 p-4 rounded-md"
        >
          {/* User type switch */}
          <div className="mb-5 text-center">
            <span className="text-slate-800 text-base font-medium">
              Please select your role:
            </span>
          </div>
          <div className="mb-8 flex items-center justify-center gap-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                ref={profileRef}
                type="radio"
                name="userType"
                value="jobseeker"
                checked={userType === "jobseeker"}
                onChange={() => setUserType("jobseeker")}
                className="accent-blue-600"
              />
              <span className="text-slate-800 text-sm font-medium">
                Looking for a job
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                ref={profileRef}
                type="radio"
                name="userType"
                value="employer"
                checked={userType === "employer"}
                onChange={() => setUserType("employer")}
                className="accent-blue-600"
              />
              <span className="text-slate-800 text-sm font-medium">
                Employer
              </span>
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
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
                className="bg-slate-100 focus:bg-transparent w-full text-sm text-slate-800 px-4 py-2.5 rounded-sm border border-gray-200 focus:border-blue-600 outline-0 transition-all"
                placeholder="Enter name"
                required
                ref={firstNameRef}
              />
            </div>
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
                className="bg-slate-100 focus:bg-transparent w-full text-sm text-slate-800 px-4 py-2.5 rounded-sm border border-gray-200 focus:border-blue-600 outline-0 transition-all"
                placeholder="Enter last name"
                required
                ref={lastNameRef}
              />
            </div>
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
                className="bg-slate-100 focus:bg-transparent w-full text-sm text-slate-800 px-4 py-2.5 rounded-sm border border-gray-200 focus:border-blue-600 outline-0 transition-all"
                placeholder="Enter email"
                required
                ref={emailRef}
              />
            </div>
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
                className="bg-slate-100 focus:bg-transparent w-full text-sm text-slate-800 px-4 py-2.5 rounded-sm border border-gray-200 focus:border-blue-600 outline-0 transition-all"
                placeholder="Enter mobile number"
                ref={numberRef}
              />
            </div>
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
                className="bg-slate-100 focus:bg-transparent w-full text-sm text-slate-800 px-4 py-2.5 rounded-sm border border-gray-200 focus:border-blue-600 outline-0 transition-all"
                placeholder="Enter password"
                required
                ref={passwordRef}
              />
            </div>
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
                className="bg-slate-100 focus:bg-transparent w-full text-sm text-slate-800 px-4 py-2.5 rounded-sm border border-gray-200 focus:border-blue-600 outline-0 transition-all"
                placeholder="Enter confirm password"
                required
                ref={cpasswordRef}
              />
            </div>
          </div>
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 text-sm font-medium tracking-wider rounded-md cursor-pointer text-white bg-blue-600 hover:bg-blue-700 focus:outline-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </div>
          <div className="my-6 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
            <p className="mx-4 text-center text-slate-500">Or</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
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
            <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={loading}
              className="w-full px-4 py-2.5 flex items-center justify-center rounded-md text-white text-sm font-medium tracking-wider cursor-pointer border-0 outline-0 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22px"
                fill="#fff"
                className="inline shrink-0 mr-4"
                viewBox="0 0 22.773 22.773"
              >
                <path
                  d="M15.769 0h.162c.13 1.606-.483 2.806-1.228 3.675-.731.863-1.732 1.7-3.351 1.573-.108-1.583.506-2.694 1.25-3.561C13.292.879 14.557.16 15.769 0zm4.901 16.716v.045c-.455 1.378-1.104 2.559-1.896 3.655-.723.995-1.609 2.334-3.191 2.334-1.367 0-2.275-.879-3.676-.903-1.482-.024-2.297.735-3.652.926h-.462c-.995-.144-1.798-.932-2.383-1.642-1.725-2.098-3.058-4.808-3.306-8.276v-1.019c.105-2.482 1.311-4.5 2.914-5.478.846-.52 2.009-.963 3.304-.765.555.086 1.122.276 1.619.464.471.181 1.06.502 1.618.485.378-.011.754-.208 1.135-.347 1.116-.403 2.21-.865 3.652-.648 1.733.262 2.963 1.032 3.723 2.22-1.466.933-2.625 2.339-2.427 4.74.176 2.181 1.444 3.457 3.028 4.209z"
                  data-original="#000000"
                />
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Log in
              </a>
            </p>
          </div>
          {error && <Alert type="danger" message={error} />}
        </form>
      </div>
    </div>
  );
};

export default SignUp;

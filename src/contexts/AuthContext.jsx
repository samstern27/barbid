import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { auth, googleProvider } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { writeUserData, sendVerificationEmail } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  fetchSignInMethodsForEmail,
  linkWithPopup,
} from "firebase/auth";
import { generateUsername } from "../utils/usernameCheck";
import { usernameCheck } from "../utils/usernameCheck";
import { getDatabase, ref, get } from "firebase/database";

// Authentication context for managing user authentication state
// Provides signup, login, logout, and Google OAuth functionality
const AuthContext = createContext();

// Custom hook to access authentication context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Authentication provider component that wraps the app
// Manages user state, authentication methods, and navigation
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // User registration with email/password
  // Creates Firebase auth user, generates unique username, and writes to database
  const signup = async (
    email,
    password,
    displayName,
    contactNumber = null,
    dateOfBirth = null
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update the user's profile with their name
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });

      // Generate a URL-safe username
      let username = generateUsername(displayName);
      let counter = 1;
      let isAvailable = false;

      // Keep trying until we find an available username
      while (!isAvailable) {
        try {
          isAvailable = !(await usernameCheck(username));
          if (!isAvailable) {
            username = `${generateUsername(displayName)}${counter}`;
            counter++;
          }
        } catch (error) {
          // If there's an error checking the username, assume it's available
          isAvailable = true;
        }
      }

      // Write user data to the database
      await writeUserData(
        userCredential.user.uid,
        username,
        displayName.split(" ")[0], // firstName
        displayName.split(" ")[1] || "", // lastName
        email,
        contactNumber,
        dateOfBirth
      );

      // Send verification email
      await sendVerificationEmail(userCredential.user);

      // Set the current user but don't navigate - user needs to verify email
      setCurrentUser(userCredential.user);
      return { user: userCredential.user, needsVerification: true };
    } catch (error) {
      throw error;
    }
  };

  // User login with email/password
  // Verifies email status and navigates to home on success
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // Sign out the user since they can't access the site
        await signOut(auth);
        throw new Error(
          "Please verify your email address before signing in. Check your inbox for a verification link."
        );
      }

      navigate(`/`);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // User logout - signs out from Firebase and navigates to landing page
  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      throw error;
    }
  };

  // Google OAuth sign-in
  // Creates new user profile if first time, or signs in existing user
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const db = getDatabase();
      const userRef = ref(db, "users/" + result.user.uid);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        // Only create username and write user data if user is new
        let username = generateUsername(result.user.displayName);
        let counter = 1;
        let isAvailable = false;
        while (!isAvailable) {
          try {
            isAvailable = !(await usernameCheck(username));
            if (!isAvailable) {
              username = `${generateUsername(
                result.user.displayName
              )}${counter}`;
              counter++;
            }
          } catch (error) {
            // If there's an error checking the username, assume it's available
            isAvailable = true;
          }
        }
        await writeUserData(
          result.user.uid,
          username,
          result.user.displayName?.split(" ")[0] || "",
          result.user.displayName?.split(" ")[1] || "",
          result.user.email,
          null, // mobileNumber
          null // dateOfBirth
        );
      }
      setCurrentUser(result.user);
      navigate("/", { replace: true });
      return result.user;
    } catch (error) {
      if (error.message.includes("already exists")) {
        throw new Error(
          "This email is already registered. Please sign in with your original method."
        );
      }
      throw error;
    }
  };

  // Resend email verification for unverified users
  const resendVerificationEmail = async () => {
    try {
      if (currentUser && !currentUser.emailVerified) {
        await sendVerificationEmail(currentUser);
        return {
          success: true,
          message: "Verification email sent successfully!",
        };
      } else {
        throw new Error("No unverified user found");
      }
    } catch (error) {
      throw error;
    }
  };

  // Listen for Firebase authentication state changes
  // Updates currentUser state and loading status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Function to refresh user auth state (useful for checking email verification)
  const refreshUser = async () => {
    if (currentUser) {
      try {
        await currentUser.reload();
        // The onAuthStateChanged listener will automatically update the state
      } catch (error) {
        // Silent error handling for production
      }
    }
  };

  // Context value object containing all authentication methods and state
  // Memoized to prevent unnecessary re-renders of consuming components
  const value = useMemo(
    () => ({
      currentUser,
      signup,
      login,
      logout,
      signInWithGoogle,
      resendVerificationEmail,
      refreshUser,
      loading,
    }),
    [currentUser, loading]
  );

  // Only render children when authentication state is loaded
  // Prevents flash of unauthenticated content
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

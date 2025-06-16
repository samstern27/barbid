import { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { writeUserData } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { generateUsername } from "../utils/usernameCheck";
import { usernameCheck } from "../utils/usernameCheck";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const signup = async (email, password, displayName, contactNumber = null) => {
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
        contactNumber
      );

      // Set the current user before navigation
      setCurrentUser(userCredential.user);
      navigate("/", { replace: true });
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate(`/`);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Log the Google user data
      console.log("Google User Data:", {
        displayName: result.user.displayName,
        email: result.user.email,
        firstName: result.user.displayName?.split(" ")[0],
        lastName: result.user.displayName?.split(" ")[1] || "",
      });

      // Generate a URL-safe username
      let username = generateUsername(result.user.displayName);
      console.log("Generated base username:", username);

      let counter = 1;
      let isAvailable = false;

      // Keep trying until we find an available username
      while (!isAvailable) {
        try {
          isAvailable = !(await usernameCheck(username));
          if (!isAvailable) {
            username = `${generateUsername(result.user.displayName)}${counter}`;
            console.log("Trying username:", username);
            counter++;
          }
        } catch (error) {
          console.error("Error checking username:", error);
          // If there's an error checking the username, assume it's available
          isAvailable = true;
        }
      }

      console.log("Final username to be used:", username);

      // Write user data to the database
      await writeUserData(
        result.user.uid,
        username,
        result.user.displayName?.split(" ")[0] || "",
        result.user.displayName?.split(" ")[1] || "",
        result.user.email,
        null
      );

      // Set the current user before navigation
      setCurrentUser(result.user);
      navigate("/", { replace: true });
      return result.user;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    signInWithGoogle,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

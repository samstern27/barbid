import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getDatabase, ref, set, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import profilePicture from "../assets/user.png";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Write user data to the database
export const writeUserData = async (
  userId,
  username,
  firstName,
  lastName,
  email,
  mobileNumber = null
) => {
  const db = getDatabase();

  // Write username mapping first
  const usernameRef = ref(db, "usernames/" + username);
  await set(usernameRef, userId);

  // Then write user data
  const userRef = ref(db, "users/" + userId);
  await set(userRef, {
    username: username,
    firstName: firstName,
    lastName: lastName,
    email: email,
    mobile: mobileNumber,
    lastLogin: new Date().toISOString(),
    profilePicture: profilePicture,
  });
};

// Initialize providers
export const googleProvider = new GoogleAuthProvider();

export default app;

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { getDatabase, ref, set, update, remove } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  listAll,
  deleteObject,
} from "firebase/storage";
import profilePicture from "../assets/user.png";

// Firebase configuration object using environment variables
// All sensitive keys are stored in .env file for security
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app and export core services
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Write user data to the database during user registration
// Creates username mapping, profile, personal info, and notification settings
export const writeUserData = async (
  userId,
  username,
  firstName,
  lastName,
  email,
  mobileNumber = null,
  dateOfBirth
) => {
  try {
    const db = getDatabase();

    // Write username mapping first for uniqueness checking
    const usernameRef = ref(db, "usernames/" + username);
    await set(usernameRef, userId);

    // Generate a random seed for a unique but consistent cover photo
    const randomSeed = Math.random().toString(36).substring(2, 15);
    const randomCoverPhoto = `https://picsum.photos/seed/${randomSeed}/1200/300`;

    // Write profile object with user information and preferences
    const userProfileRef = ref(db, "users/" + userId + "/profile");
    await set(userProfileRef, {
      username: username,
      firstName: firstName,
      lastName: lastName,
      about: "",
      oneLine: "",
      occupation: "",
      skills: [],
      theme: "blue",
      avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${randomSeed}`,
      profilePicture: profilePicture,
      coverPhoto: randomCoverPhoto,
      lastLogin: new Date().toISOString(),
    });

    // Write personal object with contact and address information
    const userPersonalRef = ref(db, "users/" + userId + "/personal");
    await set(userPersonalRef, {
      email: email,
      mobile: mobileNumber,
      dateOfBirth: dateOfBirth,
      country: "United Kingdom",
      streetAddress: "",
      city: "",
      county: "",
      postalCode: "",
    });

    // Write notification settings with default preferences
    const userNotificationsRef = ref(db, "users/" + userId + "/notifications");
    await set(userNotificationsRef, {
      jobAlertsTurnedOn: true,
      applicationAlertsTurnedOn: true,
    });

    console.log("User data written successfully:", { userId, username });
  } catch (error) {
    console.error("Error writing user data to database:", error);
    throw new Error(`Failed to write user data: ${error.message}`);
  }
};

// Initialize Google OAuth provider for social sign-in
export const googleProvider = new GoogleAuthProvider();

// Delete all user data from the database
// Removes profile, personal info, settings, and username mapping
const deleteUserFromDatabase = async (userId, username) => {
  const db = getDatabase();
  // Remove user data sections
  await Promise.all([
    remove(ref(db, `users/${userId}/profile`)),
    remove(ref(db, `users/${userId}/personal`)),
    remove(ref(db, `users/${userId}/settings`)),
    remove(ref(db, `users/${userId}`)), // Remove any other leftover data
    remove(ref(db, `usernames/${username}`)),
  ]);
};

// Recursively delete all files in a storage folder
// Handles nested subfolders and their contents
const deleteAllFilesInFolder = async (folderRef) => {
  const listResult = await listAll(folderRef);
  // Delete all files in this folder
  await Promise.all(listResult.items.map((itemRef) => deleteObject(itemRef)));
  // Recursively delete files in subfolders
  await Promise.all(listResult.prefixes.map(deleteAllFilesInFolder));
};

// Delete all user files from Firebase Storage
const deleteUserFromStorage = async (userId) => {
  const storage = getStorage();
  const userFolderRef = storageRef(storage, `users/${userId}`);
  await deleteAllFilesInFolder(userFolderRef);
};

// Delete user from Firebase Authentication
const deleteUserFromAuth = async (userId) => {
  const user = auth.currentUser;
  await deleteUser(user);
};

// Complete user data deletion across all Firebase services
// Removes data from Database, Storage, and Authentication
export const deleteAllUserData = async (userId, username) => {
  await deleteUserFromDatabase(userId, username);
  await deleteUserFromStorage(userId);
  await deleteUserFromAuth(userId);
};

// Send email verification to user
// Used during registration to verify email address
export const sendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user);
    return { success: true, message: "Verification email sent successfully!" };
  } catch (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

// Send password reset email to user
// Allows users to reset forgotten passwords
export const sendPasswordResetEmailToUser = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Password reset email sent successfully!",
    };
  } catch (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

// Update user password with re-authentication
// Requires current password for security before allowing change
export const updateUserPassword = async (
  user,
  currentPassword,
  newPassword
) => {
  try {
    // Re-authenticate user before password change for security
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // Update password after successful re-authentication
    await updatePassword(user, newPassword);
    return { success: true, message: "Password updated successfully!" };
  } catch (error) {
    throw new Error(`Failed to update password: ${error.message}`);
  }
};

export default app;

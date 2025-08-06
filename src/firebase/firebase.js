import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, deleteUser } from "firebase/auth";
import { getDatabase, ref, set, update, remove } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  listAll,
  deleteObject,
} from "firebase/storage";
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
  mobileNumber = null,
  dateOfBirth
) => {
  const db = getDatabase();

  // Write username mapping first
  const usernameRef = ref(db, "usernames/" + username);
  await set(usernameRef, userId);

  // Generate a random seed for a unique but consistent cover photo
  const randomSeed = Math.random().toString(36).substring(2, 15);
  const randomCoverPhoto = `https://picsum.photos/seed/${randomSeed}/1200/300`;

  // Write profile object
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
    reviews: [
      {
        rating: 5,
        comment: "This is a test review",
        date: new Date().toISOString(),
        user: userId,
      },
    ],
    lastLogin: new Date().toISOString(),
  });

  // Write personal object
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

  // Write settings object
  const userNotificationsRef = ref(db, "users/" + userId + "/notifications");
  await set(userNotificationsRef, {
    jobAlertsTurnedOn: true,
    applicationAlertsTurnedOn: true,
  });
};

// Initialize providers
export const googleProvider = new GoogleAuthProvider();

// Delete all user data from the database
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

const deleteAllFilesInFolder = async (folderRef) => {
  const listResult = await listAll(folderRef);
  // Delete all files in this folder
  await Promise.all(listResult.items.map((itemRef) => deleteObject(itemRef)));
  // Recursively delete files in subfolders
  await Promise.all(listResult.prefixes.map(deleteAllFilesInFolder));
};

const deleteUserFromStorage = async (userId) => {
  const storage = getStorage();
  const userFolderRef = storageRef(storage, `users/${userId}`);
  await deleteAllFilesInFolder(userFolderRef);
};

const deleteUserFromAuth = async (userId) => {
  const user = auth.currentUser;
  await deleteUser(user);
};

export const deleteAllUserData = async (userId, username) => {
  await deleteUserFromDatabase(userId, username);
  await deleteUserFromStorage(userId);
  await deleteUserFromAuth(userId);
};

export default app;

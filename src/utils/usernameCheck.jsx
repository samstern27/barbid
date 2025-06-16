import { getDatabase, ref, get } from "firebase/database";

// Username validation regex - allows letters, numbers, underscores, and hyphens (NO DOTS)
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export const generateUsername = (displayName) => {
  if (!displayName) {
    console.warn("No display name provided for username generation");
    return "user" + Math.floor(Math.random() * 1000);
  }

  console.log("Generating username from:", displayName);

  // Convert to lowercase and remove spaces
  let baseUsername = displayName.toLowerCase().replace(/\s+/g, "");
  console.log("After lowercase and space removal:", baseUsername);

  // Remove any characters that aren't letters, numbers, underscores, or hyphens
  baseUsername = baseUsername.replace(/[^a-z0-9_-]/g, "");
  console.log("After removing special characters:", baseUsername);

  // If the result is empty or too short, generate a fallback
  if (!baseUsername || baseUsername.length < 3) {
    console.warn("Generated username too short, using fallback");
    baseUsername = "user" + Math.floor(Math.random() * 1000);
  }

  console.log("Final generated username:", baseUsername);
  return baseUsername;
};

export const validateUsername = (username) => {
  if (!username) return { valid: false, error: "Username is required" };
  if (username.length < 3)
    return { valid: false, error: "Username must be at least 3 characters" };
  if (username.length > 30)
    return { valid: false, error: "Username must be less than 30 characters" };
  if (!USERNAME_REGEX.test(username)) {
    return {
      valid: false,
      error:
        "Username can only contain letters, numbers, underscores, and hyphens",
    };
  }
  return { valid: true };
};

export const usernameCheck = async (username) => {
  if (!username) return false;

  // Validate username format first
  const validation = validateUsername(username);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const db = getDatabase();
  const usernameRef = ref(db, "usernames/" + username);

  try {
    const snapshot = await get(usernameRef);
    // If the path doesn't exist or the value is null, the username is available
    return snapshot.exists() && snapshot.val() !== null;
  } catch (error) {
    console.error("Error checking username:", error);
    return false;
  }
};

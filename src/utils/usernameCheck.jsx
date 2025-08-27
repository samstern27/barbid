import { getDatabase, ref, get } from "firebase/database";

// Username validation regex - allows letters, numbers, underscores, and hyphens (NO DOTS)
// Ensures usernames are URL-safe and database-friendly
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

// Generate a username from a display name
// Converts display names to URL-safe usernames with fallback generation
export const generateUsername = (displayName) => {
  if (!displayName) {
    // Generate fallback username if no display name provided
    return "user" + Math.floor(Math.random() * 1000);
  }

  // Convert to lowercase and remove spaces
  let baseUsername = displayName.toLowerCase().replace(/\s+/g, "");

  // Remove any characters that aren't letters, numbers, underscores, or hyphens
  baseUsername = baseUsername.replace(/[^a-z0-9_-]/g, "");

  // If the result is empty or too short, generate a fallback
  if (!baseUsername || baseUsername.length < 3) {
    baseUsername = "user" + Math.floor(Math.random() * 1000);
  }

  return baseUsername;
};

// Validate username format and length requirements
// Returns validation result with error message if invalid
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

// Check if a username is already taken in the database
// Validates format first, then queries Firebase for availability
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
    // Silent error handling for production - return false on database errors
    return false;
  }
};

// Utility function to extract a user-friendly file name from a File object or a Firebase Storage URL
// Handles different input types and provides fallback names for UI display
// - If given a File, returns its .name
// - If given a URL, decodes it and extracts the file name after the last slash
// - If nothing is provided, returns a default string
export function getFileNameFromStoragePath(pathOrUrl) {
  if (!pathOrUrl) return "No file chosen"; // No file selected

  if (pathOrUrl instanceof File) return pathOrUrl.name; // File object

  try {
    // Decode URL-encoded string (for Firebase Storage URLs)
    const decoded = decodeURIComponent(pathOrUrl);

    // Remove any query params (e.g., ?alt=media...)
    const clean = decoded.split("?")[0];

    // Return the file name after the last /
    return clean.substring(clean.lastIndexOf("/") + 1);
  } catch {
    return "Current photo"; // Fallback if something goes wrong
  }
}

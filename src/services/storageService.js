import { storage } from "../firebase/firebase";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Upload a file to a given path in Firebase Storage and return the download URL
// path: the storage path (e.g., users/uid/profile/filename.jpg)
// file: the File or Blob to upload
export async function uploadFileToStorage(path, file) {
  const fileRef = storageRef(storage, path); // Create a reference to the desired path
  await uploadBytes(fileRef, file); // Upload the file
  return await getDownloadURL(fileRef); // Return the download URL for the uploaded file
}

// Delete a file from Firebase Storage by its download URL
// url: the download URL of the file to delete
export async function deleteFileByUrl(url) {
  try {
    // Extract the storage path from the download URL using regex
    const match = url.match(/\/o\/(.*?)\?/);
    if (match && match[1]) {
      const filePath = decodeURIComponent(match[1]); // Decode the path
      const fileRef = storageRef(storage, filePath); // Reference to the file
      await deleteObject(fileRef); // Delete the file
    }
  } catch (err) {
    // Log but don't throw to avoid breaking the flow if deletion fails
    console.warn("Failed to delete file:", err);
  }
}

// Move a file from an old download URL to a new storage path
// Downloads the file, uploads it to the new path, deletes the old file, and returns the new download URL
export async function moveFileToNewPath(oldUrl, newPath) {
  try {
    // Download the old file as a blob
    const response = await fetch(oldUrl);
    const blob = await response.blob();
    // Upload to the new path
    const newFileRef = storageRef(storage, newPath);
    await uploadBytes(newFileRef, blob);
    const newUrl = await getDownloadURL(newFileRef);
    // Delete the old file
    await deleteFileByUrl(oldUrl);
    return newUrl; // Return the new download URL
  } catch (err) {
    // If anything fails, log and return the old URL as a fallback
    console.warn("Failed to move file:", err);
    return oldUrl;
  }
}

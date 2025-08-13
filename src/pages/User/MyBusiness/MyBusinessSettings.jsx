import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBusiness } from "../../../contexts/BusinessContext";
import { useAuth } from "../../../contexts/AuthContext";
import { getDatabase, ref, remove, get, update } from "firebase/database";
import {
  ExclamationTriangleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const MyBusinessSettings = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { selectedBusiness } = useBusiness();
  const { currentUser } = useAuth();

  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // Editable fields
  const [editableFields, setEditableFields] = useState({
    phone: selectedBusiness?.phone || "",
    privacy: selectedBusiness?.privacy || "public",
    description: selectedBusiness?.description || "",
  });

  const handleDeleteBusiness = async () => {
    if (!selectedBusiness || !currentUser?.uid) return;

    setDeleting(true);
    setError("");

    try {
      const db = getDatabase();

      // 1. Get all jobs for this business from public jobs
      const publicJobsRef = ref(db, "public/jobs");
      const publicJobsSnapshot = await get(publicJobsRef);

      if (publicJobsSnapshot.exists()) {
        const allJobs = publicJobsSnapshot.val();
        const businessJobIds = [];

        // Find all job IDs that belong to this business
        Object.entries(allJobs).forEach(([jobId, jobData]) => {
          if (jobData.businessId === businessId) {
            businessJobIds.push(jobId);
          }
        });

        // 2. Delete all public jobs for this business
        const deletePromises = businessJobIds.map((jobId) =>
          remove(ref(db, `public/jobs/${jobId}`))
        );

        // 3. Delete the business from user's business list
        const userBusinessRef = ref(
          db,
          `users/${currentUser.uid}/business/${businessId}`
        );

        // 4. Execute all deletions
        await Promise.all([...deletePromises, remove(userBusinessRef)]);

        // 5. Navigate back to businesses list
        navigate("/my-business");
      } else {
        // No public jobs to delete, just delete the business
        const userBusinessRef = ref(
          db,
          `users/${currentUser.uid}/business/${businessId}`
        );
        await remove(userBusinessRef);
        navigate("/my-business");
      }
    } catch (error) {
      console.error("Error deleting business:", error);
      setError("Failed to delete business. Please try again.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedBusiness || !currentUser?.uid) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const db = getDatabase();
      const userBusinessRef = ref(
        db,
        `users/${currentUser.uid}/business/${businessId}`
      );

      // Update only the editable fields
      await update(userBusinessRef, {
        phone: editableFields.phone,
        privacy: editableFields.privacy,
        description: editableFields.description,
      });

      setSuccess("Business settings updated successfully!");
      setEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating business:", error);
      setError("Failed to update business settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset editable fields to original values
    setEditableFields({
      phone: selectedBusiness?.phone || "",
      privacy: selectedBusiness?.privacy || "public",
      description: selectedBusiness?.description || "",
    });
    setEditing(false);
    setError("");
  };

  if (!selectedBusiness) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <div className="text-gray-500 text-lg">Business not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Business Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your business settings and preferences.
        </p>
      </div>

      {/* Business Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Business Information
          </h3>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={saving}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Name
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {selectedBusiness.name}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Type
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {selectedBusiness.type || "Not specified"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            {editing ? (
              <input
                type="tel"
                value={editableFields.phone}
                onChange={(e) =>
                  setEditableFields((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-2 border-indigo-300 bg-indigo-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white sm:text-sm transition-colors duration-200"
                placeholder="Enter phone number"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">
                {selectedBusiness.phone || "Not specified"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Privacy
            </label>
            {editing ? (
              <select
                value={editableFields.privacy}
                onChange={(e) =>
                  setEditableFields((prev) => ({
                    ...prev,
                    privacy: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-2 border-indigo-300 bg-indigo-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white sm:text-sm transition-colors duration-200"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            ) : (
              <p className="mt-1 text-sm text-gray-900 capitalize">
                {selectedBusiness.privacy || "public"}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {selectedBusiness.address}, {selectedBusiness.city},{" "}
              {selectedBusiness.postcode}
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            {editing ? (
              <textarea
                value={editableFields.description}
                onChange={(e) =>
                  setEditableFields((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className="mt-1 block w-full rounded-md border-2 border-indigo-300 bg-indigo-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white sm:text-sm transition-colors duration-200"
                placeholder="Enter business description"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">
                {selectedBusiness.description || "No description provided"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <h3 className="ml-3 text-lg font-medium text-red-800">Danger Zone</h3>
        </div>
        <div className="mt-4 text-sm text-red-700">
          <p>
            Once you delete a business, there is no going back. This will
            permanently delete:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>The business profile and all its data</li>
            <li>All job listings associated with this business</li>
            <li>All applications for those jobs</li>
            <li>This action cannot be undone</li>
          </ul>
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrashIcon className="h-4 w-4" />
            {deleting ? "Deleting..." : "Delete Business"}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Delete Business
              </h3>
              <div className="mt-2 px-7">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete{" "}
                  <strong>{selectedBusiness.name}</strong>?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This will permanently delete the business and all associated
                  job listings. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBusiness}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom spacing */}
      <div className="h-8"></div>
    </div>
  );
};

export default MyBusinessSettings;

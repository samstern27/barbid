import {
  PaperClipIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  EyeIcon,
} from "@heroicons/react/20/solid";
import { useBusiness } from "../../../contexts/BusinessContext";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { useState } from "react";
import { getDatabase, ref, update, increment } from "firebase/database";

export default function ViewJob() {
  const { jobId } = useParams();
  const { selectedBusiness, updateJob, deleteJob } = useBusiness();
  const job = selectedBusiness?.jobs?.[jobId];
  const navigate = useNavigate();

  // State for editing different fields
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  console.log(job);

  // If job doesn't exist, show loading or redirect
  if (!job) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Job not found or has been deleted.</p>
          <button
            onClick={() =>
              navigate(`/my-business/${selectedBusiness?.id}/job-listings`)
            }
            className="mt-2 text-indigo-600 hover:text-indigo-500"
          >
            Back to Job Listings
          </button>
        </div>
      </div>
    );
  }

  // Edit job
  const handleEdit = (field, currentValue) => {
    setEditingField(field);
    setEditValues({ ...editValues, [field]: currentValue });
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingField(null);
    setEditValues({});
  };

  // Save job
  const handleSave = async (field) => {
    setIsSaving(true);
    try {
      const updatedJob = {
        ...job,
        [field]: editValues[field],
      };

      await updateJob(jobId, updatedJob);
      setEditingField(null);
      setEditValues({});
    } catch (error) {
      console.error("Error updating job:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Input change
  const handleInputChange = (field, value) => {
    setEditValues({ ...editValues, [field]: value });
  };

  // Delete job
  const handleDeleteJob = async () => {
    setIsDeleting(true);
    try {
      await deleteJob(jobId);

      const db = getDatabase();
      const businessRef = ref(db, "businesses/" + selectedBusiness.id);
      await update(businessRef, {
        jobListings: increment(-1),
      });

      // Navigate immediately after successful deletion
      navigate(`/my-business/${selectedBusiness.id}/job-listings`);
    } catch (error) {
      console.error("Error deleting job:", error);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="animate-[fadeIn_1.2s_ease-in-out]">
      <NavLink
        to={`/my-business/${selectedBusiness.id}/job-listings`}
        className="inline-flex items-center gap-2 text-sm mb-6 font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Job Listings
      </NavLink>
      <div className="">
        <h3 className="text-base/7 font-semibold text-gray-900">Job Details</h3>
        <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">
          View and manage job details.
        </p>
      </div>
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Job Title</dt>
            <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <span className="grow">{job.jobTitle}</span>
              <span className="ml-4 shrink-0">
                <button
                  type="button"
                  className="rounded-md bg-white font-medium text-gray-400 cursor-not-allowed"
                  disabled
                  title="Job title cannot be modified once job is created"
                >
                  Locked
                </button>
              </span>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Description</dt>
            <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              {editingField === "description" ? (
                <>
                  <textarea
                    value={editValues.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                    className="grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <span className="ml-4 shrink-0 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleSave("description")}
                      disabled={isSaving}
                      className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="rounded-md bg-white font-medium text-gray-600 hover:text-gray-500"
                    >
                      Cancel
                    </button>
                  </span>
                </>
              ) : (
                <>
                  <span className="grow">{job.description}</span>
                  <span className="ml-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit("description", job.description)}
                      className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Update
                    </button>
                  </span>
                </>
              )}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Pay Rate</dt>
            <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <span className="grow">£{job.payRate}/hr</span>
              <span className="ml-4 shrink-0">
                <button
                  type="button"
                  className="rounded-md bg-white font-medium text-gray-400 cursor-not-allowed"
                  disabled
                  title="Pay rate cannot be modified once job is created"
                >
                  Locked
                </button>
              </span>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Start Time</dt>
            <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <span className="grow">
                {new Date(job.startOfShift).toLocaleString()}
              </span>
              <span className="ml-4 shrink-0">
                <button
                  type="button"
                  className="rounded-md bg-white font-medium text-gray-400 cursor-not-allowed"
                  disabled
                  title="Start time cannot be modified once job is created"
                >
                  Locked
                </button>
              </span>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">End Time</dt>
            <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <span className="grow">
                {new Date(job.endOfShift).toLocaleString()}
              </span>
              <span className="ml-4 shrink-0">
                <button
                  type="button"
                  className="rounded-md bg-white font-medium text-gray-400 cursor-not-allowed"
                  disabled
                  title="End time cannot be modified once job is created"
                >
                  Locked
                </button>
              </span>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Status</dt>
            <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              {editingField === "status" ? (
                <>
                  <select
                    value={editValues.status || ""}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Filled">Filled</option>
                  </select>
                  <span className="ml-4 shrink-0 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleSave("status")}
                      disabled={isSaving}
                      className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="rounded-md bg-white font-medium text-gray-600 hover:text-gray-500"
                    >
                      Cancel
                    </button>
                  </span>
                </>
              ) : (
                <>
                  <span className="grow">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        job.status === "Open"
                          ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                          : "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20"
                      }`}
                    >
                      {job.status}
                    </span>
                  </span>
                  <span className="ml-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit("status", job.status)}
                      className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Update
                    </button>
                  </span>
                </>
              )}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Applicants</dt>
            <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <span className="grow">
                {job.applicants} applicant{job.applicants !== 1 ? "s" : ""}
              </span>
              <span className="ml-4 shrink-0">
                <NavLink
                  to={`/my-business/${selectedBusiness.id}/job-listings/${jobId}/applicants`}
                  className="text-red-500 hover:text-red-600 flex items-center gap-2"
                >
                  <EyeIcon className="w-4 h-4" />
                  View
                  <span className="sr-only">, {job.applicants} applicants</span>
                </NavLink>
              </span>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Created</dt>
            <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <span className="grow">
                {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Delete Job</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-gray-900">
                    Permanently delete this job listing
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  Delete Job
                </button>
              </div>
            </dd>
          </div>
        </dl>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationTriangleIcon
                    className="h-6 w-6 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Delete Job Listing
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete "{job.jobTitle}"? This
                      action cannot be undone and will permanently remove the
                      job listing.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteJob}
                  disabled={isDeleting}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

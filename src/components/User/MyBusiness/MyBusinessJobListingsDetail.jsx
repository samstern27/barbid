import { useBusiness } from "../../../contexts/BusinessContext";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getDatabase,
  ref,
  update,
  increment,
  onValue,
} from "firebase/database";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Loader from "../../UI/Loader";

export default function MyBusinessJobListingsDetail() {
  const { jobId } = useParams();
  const { selectedBusiness, updateJob, deleteJob } = useBusiness();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for editing different fields
  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Verification code input state
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    const db = getDatabase();
    const jobRef = ref(db, `public/jobs/${jobId}`);

    const unsubscribe = onValue(jobRef, (snapshot) => {
      if (snapshot.exists()) {
        const jobData = snapshot.val();
        setJob({
          id: jobId,
          ...jobData,
          applicantCount: jobData.applicantCount || 0,
        });
      } else {
        setError("Job not found");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [jobId]);

  // Show loading state while fetching job data
  if (loading) {
    return (
      <div className="flex flex-1 flex-col justify-center items-center min-h-[60vh]">
        <Loader size="2xl" text="Loading job details..." />
      </div>
    );
  }

  // If job doesn't exist after loading, show error
  if (!job) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Job not found or has been deleted.</p>
          <NavLink
            to={`/my-business/${selectedBusiness?.id}/job-listings`}
            className="mt-2 text-indigo-600 hover:text-indigo-500"
          >
            Back to Job Listings
          </NavLink>
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

  // Handle verification code submission
  const handleVerification = async () => {
    if (!verificationCode || !job) return;

    setVerifying(true);
    setVerificationResult(null);

    try {
      const db = getDatabase();

      if (verificationCode === job.verificationCode) {
        // Code is correct - mark applicant as attended
        const acceptedUserId = job.acceptedUserId;

        // Update the job application status to mark as attended
        const applicationRef = ref(
          db,
          `public/jobs/${jobId}/jobApplications/${acceptedUserId}`
        );
        const now = new Date();
        // Store both UTC time and UK time for clarity
        await update(applicationRef, {
          attended: true,
          attendedAt: now.toISOString(),
          attendedAtLocal: now.toLocaleString("en-GB", {
            timeZone: "Europe/London",
          }),
          status: "Completed",
        });

        // Also update the public job to mark as completed
        const jobRef = ref(db, `public/jobs/${jobId}`);
        await update(jobRef, {
          status: "Completed",
          completedAt: now.toISOString(),
          completedAtLocal: now.toLocaleString("en-GB", {
            timeZone: "Europe/London",
          }),
          applicantAttended: true,
        });

        setVerificationResult({
          success: true,
          message: "Verification successful! Applicant marked as attended.",
        });
        setVerificationCode("");
      } else {
        setVerificationResult({
          success: false,
          message: "Incorrect verification code. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setVerificationResult({
        success: false,
        message: "Error verifying code. Please try again.",
      });
    } finally {
      setVerifying(false);
    }
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
      {loading && <div className="text-center py-8">Loading...</div>}
      {error && <div className="text-center py-8 text-red-600">{error}</div>}
      {!loading && !error && job && (
        <>
          <NavLink
            to={`/my-business/${selectedBusiness.id}/job-listings`}
            className="inline-flex items-center gap-2 text-sm mb-6 font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Job Listings
          </NavLink>
          <div className="">
            <h3 className="text-base/7 font-semibold text-gray-900">
              Job Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">
              View and manage job details.
            </p>
            {job.status === "Completed" && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="text-sm font-medium text-amber-800">
                    Job Locked - Work in Progress
                  </span>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  This job is now locked for editing while the applicant is
                  working. You can still view applicants and job details.
                </p>
              </div>
            )}
          </div>

          {/* Verification Code Section - Show when job is filled */}
          {job.status === "Filled" && job.verificationCode && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  <CheckIcon className="w-5 h-5 inline mr-2" />
                  Job Filled - Verification Required
                </h3>
                <p className="text-sm text-green-700 mb-4">
                  When the accepted applicant arrives, ask them for their
                  verification code to confirm their identity.
                </p>

                {/* Verification Code Input */}
                <div className="mt-6 bg-white border-2 border-green-300 rounded-lg p-6">
                  <h4 className="text-md font-medium text-green-900 mb-3">
                    Verify Applicant Attendance
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                    <input
                      type="text"
                      placeholder="Enter verification code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="px-4 py-2 border border-green-300 rounded-md text-center font-mono text-lg tracking-wider focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      maxLength="6"
                      pattern="[0-9]{6}"
                    />
                    <button
                      type="button"
                      onClick={handleVerification}
                      disabled={verifying || !verificationCode}
                      className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verifying ? "Verifying..." : "Verify & Mark Attended"}
                    </button>
                  </div>

                  {/* Verification Result */}
                  {verificationResult && (
                    <div
                      className={`mt-3 p-3 rounded-md ${
                        verificationResult.success
                          ? "bg-green-50 border border-green-200 text-green-800"
                          : "bg-red-50 border border-red-200 text-red-800"
                      }`}
                    >
                      {verificationResult.message}
                    </div>
                  )}

                  <p className="text-xs text-green-600 mt-3">
                    Enter the 6-digit code the applicant provides to mark them
                    as attended
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Completed Job Section - Show when job is completed */}
          {job.status === "Completed" && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  <CheckIcon className="w-5 h-5 inline mr-2" />
                  Applicant Arrived & Started
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  The applicant has arrived and been verified. They are now
                  working this shift.
                </p>

                <div className="bg-white border-2 border-blue-300 rounded-lg p-4 inline-block">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs text-blue-600 mb-1">START DATE</p>
                      <p className="text-lg font-bold text-blue-900">
                        {job.completedAt
                          ? new Date(job.completedAt).toLocaleDateString(
                              "en-GB",
                              { timeZone: "Europe/London" }
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 mb-1">START TIME</p>
                      <p className="text-lg font-bold text-blue-900">
                        {job.completedAt
                          ? new Date(job.completedAt).toLocaleTimeString(
                              "en-GB",
                              { timeZone: "Europe/London" }
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-blue-600 mt-3">
                  This records when the applicant arrived and started working
                  this shift.
                </p>
              </div>
            </div>
          )}
          <div className="mt-6 border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900">
                  Job Title
                </dt>
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
                <dt className="text-sm/6 font-medium text-gray-900">
                  Description
                </dt>
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
                        {job.status === "Completed" ? (
                          <button
                            type="button"
                            className="rounded-md bg-white font-medium text-gray-400 cursor-not-allowed"
                            disabled
                            title="Cannot modify job details while work is in progress"
                          >
                            Locked
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit("description", job.description)
                            }
                            className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Update
                          </button>
                        )}
                      </span>
                    </>
                  )}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900">
                  Pay Rate
                </dt>
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
                <dt className="text-sm/6 font-medium text-gray-900">
                  Start Time
                </dt>
                <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <span className="grow">
                    {new Date(job.startOfShift).toLocaleString("en-GB", {
                      timeZone: "Europe/London",
                    })}
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
                <dt className="text-sm/6 font-medium text-gray-900">
                  End Time
                </dt>
                <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <span className="grow">
                    {new Date(job.endOfShift).toLocaleString("en-GB", {
                      timeZone: "Europe/London",
                    })}
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
                              : job.status === "Filled"
                              ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"
                              : job.status === "Completed"
                              ? "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20"
                              : "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20"
                          }`}
                        >
                          {job.status}
                        </span>
                      </span>
                      <span className="ml-4 shrink-0">
                        {job.status === "Completed" ? (
                          <button
                            type="button"
                            className="rounded-md bg-white font-medium text-gray-400 cursor-not-allowed"
                            disabled
                            title="Cannot modify job status while work is in progress"
                          >
                            Locked
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEdit("status", job.status)}
                            className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Update
                          </button>
                        )}
                      </span>
                    </>
                  )}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm/6 font-medium text-gray-900">
                  Applicants
                </dt>
                <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <span className="grow">
                    {job.applicantCount} applicant
                    {job.applicantCount !== 1 ? "s" : ""}
                  </span>
                  <span className="ml-4 shrink-0">
                    <NavLink
                      to={`/my-business/${selectedBusiness.id}/job-listings/${jobId}/applicants`}
                      className="text-indigo-500 hover:text-indigo-600 flex items-center gap-2"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View
                      <span className="sr-only">
                        , {job.applicantCount} applicants
                      </span>
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
                <dt className="text-sm/6 font-medium text-gray-900">
                  Delete Job
                </dt>
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
        </>
      )}

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

"use client";
import userPhoto from "../../assets/user.png";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useAuth } from "../../contexts/AuthContext";
import { getDatabase, ref, onValue, update, set } from "firebase/database";
import { useState, useEffect } from "react";
import { generateUsername } from "../../utils/usernameCheck";
import { usernameCheck } from "../../utils/usernameCheck";
import {
  uploadFileToStorage,
  deleteFileByUrl,
  moveFileToNewPath,
} from "../../services/storageService";
import { getFileNameFromStoragePath } from "../../utils/fileHelpers";
import UploadAlert from "../../components/User/UserSettings/UploadAlert";

import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";
const occupations = [
  { id: 1, name: "Barista" },
  { id: 2, name: "Bar Back" },
  { id: 3, name: "Bar Manager" },
  { id: 4, name: "Bar Supervisor" },
  { id: 5, name: "Bartender" },
  { id: 6, name: "Busser" },
  { id: 7, name: "Cafe Host" },
  { id: 8, name: "Cafe Manager" },
  { id: 9, name: "Cafe Server" },
  { id: 10, name: "Cafe Supervisor" },
  { id: 11, name: "Club Host" },
  { id: 12, name: "Club Manager" },
  { id: 13, name: "Club Server" },
  { id: 14, name: "Club Supervisor" },
  { id: 15, name: "Floor Manager" },
  { id: 16, name: "Food Runner" },
  { id: 17, name: "Host/Hostess" },
  { id: 18, name: "Restaurant Host" },
  { id: 19, name: "Restaurant Manager" },
  { id: 20, name: "Restaurant Supervisor" },
  { id: 21, name: "Server" },
  { id: 22, name: "VIP Host" },
  { id: 23, name: "VIP Manager" },
  { id: 24, name: "VIP Server" },
  { id: 25, name: "Waiter/Waitress" },
  { id: 26, name: "Other" },
  { id: 27, name: "Unemployed" },
];
export default function UserSettings() {
  // Get the current user from AuthContext
  const { currentUser } = useAuth();
  // State for loading, error, and success messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Store the original data for reset functionality
  const [originalData, setOriginalData] = useState(null);
  const [selectedOccupation, setSelectedOccupation] = useState(null);
  // Form state for all user fields
  const [formData, setFormData] = useState({
    username: "",
    about: "",
    profilePicture: "",
    coverPhoto: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    country: "United Kingdom",
    streetAddress: "",
    city: "",
    county: "",
    postalCode: "",
    jobAlertsTurnedOn: true,
    applicationAlertsTurnedOn: true,
    skills: [],
  });

  // Add state for new skill input
  const [newSkill, setNewSkill] = useState("");

  // Load user data from the database when the component mounts or user changes
  useEffect(() => {
    const db = getDatabase();
    const reference = ref(db, "users/" + currentUser?.uid);
    // Listen for changes to the user's data
    onValue(reference, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Merge loaded data with default form state
        const formattedData = {
          ...formData,
          ...data,
          // Ensure boolean values are properly set
          jobAlertsTurnedOn: data.jobAlertsTurnedOn ?? true,
          applicationAlertsTurnedOn: data.applicationAlertsTurnedOn ?? true,
        };
        setFormData(formattedData);
        setOriginalData(formattedData);
        // Set the selected occupation if it exists in the data
        if (data.occupation) {
          const matchingOccupation = occupations.find(
            (occ) => occ.name === data.occupation
          );
          setSelectedOccupation(matchingOccupation || null);
        }
      }
    });
  }, [currentUser]);

  // Handle changes to form inputs (including file inputs)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // For file inputs, store the File object
    if (name === "profilePicture" || name === "coverPhoto") {
      setFormData((prev) => ({ ...prev, [name]: e.target.files[0] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle adding a new skill
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  // Handle removing a skill
  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  // Handle key press for adding skills
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill(e);
    }
  };

  // Handle profile section submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const db = getDatabase();
      const userRef = ref(db, "users/" + currentUser.uid);
      let usernameChanged = formData.username !== originalData.username;
      let newProfilePictureURL = formData.profilePicture;
      let newCoverPhotoURL = formData.coverPhoto;

      // --- USERNAME CHANGE LOGIC ---
      if (usernameChanged) {
        const isTaken = await usernameCheck(formData.username);
        if (isTaken) {
          setError("That username is already taken. Please choose another.");
          setLoading(false);
          return;
        }
        if (originalData.username) {
          const oldUsernameRef = ref(db, "usernames/" + originalData.username);
          await set(oldUsernameRef, null);
        }
        const newUsernameRef = ref(db, "usernames/" + formData.username);
        await set(newUsernameRef, currentUser.uid);
      }

      // --- PROFILE PICTURE UPLOAD/UPDATE LOGIC ---
      if (formData.profilePicture && formData.profilePicture instanceof File) {
        if (
          originalData.profilePicture &&
          typeof originalData.profilePicture === "string" &&
          originalData.profilePicture.startsWith("https://")
        ) {
          await deleteFileByUrl(originalData.profilePicture);
        }
        newProfilePictureURL = await uploadFileToStorage(
          `users/${currentUser.uid}/profile/${formData.profilePicture.name}`,
          formData.profilePicture
        );
      }

      // --- COVER PHOTO UPLOAD/UPDATE LOGIC ---
      if (formData.coverPhoto && formData.coverPhoto instanceof File) {
        if (
          originalData.coverPhoto &&
          typeof originalData.coverPhoto === "string" &&
          originalData.coverPhoto.startsWith("https://")
        ) {
          await deleteFileByUrl(originalData.coverPhoto);
        }
        newCoverPhotoURL = await uploadFileToStorage(
          `users/${currentUser.uid}/cover/${formData.coverPhoto.name}`,
          formData.coverPhoto
        );
      }

      // --- UPDATE USER DATA IN DATABASE ---
      await update(userRef, {
        username: formData.username,
        about: formData.about,
        profilePicture: newProfilePictureURL,
        coverPhoto: newCoverPhotoURL,
        occupation: selectedOccupation?.name || null,
        skills: formData.skills,
        mobile: formData.mobile,
        lastUpdated: new Date().toISOString(),
      });
      setOriginalData({
        ...originalData,
        username: formData.username,
        about: formData.about,
        profilePicture: newProfilePictureURL,
        coverPhoto: newCoverPhotoURL,
        occupation: selectedOccupation?.name || null,
        skills: formData.skills,
        mobile: formData.mobile,
      });
      setSuccess("Profile settings updated successfully!");
    } catch (error) {
      setError(error.message || "Failed to update profile settings");
    } finally {
      setLoading(false);
    }
  };

  // Reset profile section
  const handleProfileReset = () => {
    if (originalData) {
      setFormData({
        ...formData,
        ...originalData,
        username: originalData.username,
        about: originalData.about,
        profilePicture: originalData.profilePicture,
        coverPhoto: originalData.coverPhoto,
        skills: originalData.skills,
      });
      // Reset the selected occupation
      if (originalData.occupation) {
        const matchingOccupation = occupations.find(
          (occ) => occ.name === originalData.occupation
        );
        setSelectedOccupation(matchingOccupation || null);
      } else {
        setSelectedOccupation(null);
      }
      setSuccess("");
      setError("");
    }
  };

  return (
    <div className="divide-y divide-gray-900/10">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base/7 font-semibold text-gray-900">Profile</h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            This information will be displayed publicly so be careful what you
            share.
          </p>
        </div>

        <form
          onSubmit={handleProfileSubmit}
          className="bg-white shadow-xs ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
        >
          <div className="px-4 py-6 sm:p-8">
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              {/* Username field with uniqueness check */}
              <div className="sm:col-span-4">
                <label
                  htmlFor="username"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Username
                </label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <div className="shrink-0 text-base text-gray-500 select-none sm:text-sm/6">
                      barbid.com/
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>

              {/* About field */}
              <div className="col-span-full">
                <label
                  htmlFor="about"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  About
                </label>
                <div className="mt-2">
                  <textarea
                    id="about"
                    name="about"
                    rows={3}
                    value={formData.about}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
                <p className="mt-3 text-sm/6 text-gray-600">
                  Write a few sentences about yourself.
                </p>
              </div>

              {/* Occupation field */}
              <div className="sm:col-span-4">
                <Listbox
                  value={selectedOccupation}
                  onChange={setSelectedOccupation}
                >
                  <Label className="block text-sm/6 font-medium text-gray-900">
                    Occupation
                  </Label>
                  <div className="relative mt-2">
                    <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                      <span className="col-start-1 row-start-1 truncate pr-6">
                        {selectedOccupation?.name}
                      </span>
                      <ChevronUpDownIcon
                        aria-hidden="true"
                        className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                      />
                    </ListboxButton>

                    <ListboxOptions
                      transition
                      className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
                    >
                      {occupations.map((occupation) => (
                        <ListboxOption
                          key={occupation.id}
                          value={occupation}
                          className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
                        >
                          <span className="block truncate font-normal group-data-selected:font-semibold">
                            {occupation.name}
                          </span>

                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-not-data-selected:hidden group-data-focus:text-white">
                            <CheckIcon aria-hidden="true" className="size-5" />
                          </span>
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>

              {/* Skills field */}
              <div className="col-span-full">
                <label
                  htmlFor="skills"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Skills
                </label>
                <div className="mt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a skill"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-x-0.5 rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="group relative -mr-1 size-3.5 rounded-xs hover:bg-yellow-600/20"
                        >
                          <span className="sr-only">Remove</span>
                          <svg
                            viewBox="0 0 14 14"
                            className="size-3.5 stroke-yellow-800/50 group-hover:stroke-yellow-800/75"
                          >
                            <path d="M4 4l6 6m0-6l-6 6" />
                          </svg>
                          <span className="absolute -inset-1" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm/6 text-gray-600">
                  Add skills relevant to your role in the hospitality industry.
                </p>
              </div>

              {/* Profile picture upload and preview */}
              <div className="col-span-full">
                <label
                  htmlFor="profile-picture"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Profile picture
                </label>
                <div className="mt-2 flex items-center gap-x-3">
                  <img
                    src={
                      formData.profilePicture instanceof File
                        ? URL.createObjectURL(formData.profilePicture)
                        : formData.profilePicture || userPhoto
                    }
                    aria-hidden="true"
                    className="size-12 rounded-full text-gray-300 object-cover"
                  />
                  {/* Hidden file input for custom button */}
                  <input
                    id="profilePictureInput"
                    name="profilePicture"
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleChange}
                  />
                  {/* Custom button to trigger file input */}
                  <button
                    type="button"
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                    onClick={() =>
                      document.getElementById("profilePictureInput").click()
                    }
                  >
                    Choose file
                  </button>
                  {/* Show the file name or current photo name */}
                  <span className="text-sm font-medium text-gray-900">
                    {getFileNameFromStoragePath(formData.profilePicture)}
                  </span>
                </div>
              </div>

              {/* Cover photo upload and preview */}
              <div className="col-span-full">
                <label
                  htmlFor="cover-photo"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Cover photo
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                  <div className="text-center">
                    <img
                      src={
                        formData.coverPhoto instanceof File
                          ? URL.createObjectURL(formData.coverPhoto)
                          : formData.coverPhoto || userPhoto
                      }
                      aria-hidden="true"
                      className="mx-auto size-12 text-gray-300 object-cover"
                    />
                    <div className="mt-4 flex text-sm/6 text-gray-600">
                      <label
                        htmlFor="coverPhotoInput"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 focus-within:outline-hidden hover:text-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="coverPhotoInput"
                          name="coverPhoto"
                          type="file"
                          onChange={handleChange}
                          className="sr-only"
                        />
                      </label>
                      <span className="pl-1" id="coverPhotoFileName">
                        {getFileNameFromStoragePath(formData.coverPhoto)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile section action buttons */}
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
            <button
              type="button"
              onClick={handleProfileReset}
              className="text-sm/6 font-semibold text-gray-900 cursor-pointer"
            >
              Reset Profile
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Personal Information Section */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <h2 className="text-base/7 font-semibold text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            This information is private and used for your account and
            communication.
          </p>
        </div>
        <div className="bg-white shadow-xs ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* First Name */}
            <div className="sm:col-span-3">
              <label
                htmlFor="firstName"
                className="block text-sm/6 font-medium text-gray-900"
              >
                First name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            {/* Last Name */}
            <div className="sm:col-span-3">
              <label
                htmlFor="lastName"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Last name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            {/* Email */}
            <div className="sm:col-span-4">
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <div className="block w-full rounded-md bg-gray-50 px-3 py-1.5 text-base text-gray-900 sm:text-sm/6">
                  {formData.email}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Your email address cannot be changed.
                </p>
              </div>
            </div>
            {/* Contact Number */}
            <div className="sm:col-span-4">
              <label
                htmlFor="mobile"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Contact number
              </label>
              <div className="mt-2">
                <input
                  type="tel"
                  name="mobile"
                  id="mobile"
                  autoComplete="tel"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            {/* Country */}
            <div className="sm:col-span-2">
              <label
                htmlFor="country"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Country
              </label>
              <div className="mt-2">
                <select
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  value={formData.country}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 sm:max-w-xs sm:text-sm/6"
                >
                  <option>United Kingdom</option>
                  <option>United States</option>
                  <option>Canada</option>
                  <option>Australia</option>
                </select>
              </div>
            </div>
            {/* Street Address */}
            <div className="col-span-full">
              <label
                htmlFor="streetAddress"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Street address
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="streetAddress"
                  id="streetAddress"
                  autoComplete="street-address"
                  value={formData.streetAddress}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            {/* City */}
            <div className="sm:col-span-2 sm:col-start-1">
              <label
                htmlFor="city"
                className="block text-sm/6 font-medium text-gray-900"
              >
                City
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="city"
                  id="city"
                  autoComplete="address-level2"
                  value={formData.city}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            {/* County */}
            <div className="sm:col-span-2">
              <label
                htmlFor="county"
                className="block text-sm/6 font-medium text-gray-900"
              >
                County
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="county"
                  id="county"
                  autoComplete="address-level1"
                  value={formData.county}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            {/* Postal Code */}
            <div className="sm:col-span-2">
              <label
                htmlFor="postalCode"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Postal code
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="postalCode"
                  id="postalCode"
                  autoComplete="postal-code"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            {/* Email Notifications */}
            <div className="col-span-full">
              <fieldset>
                <legend className="text-sm/6 font-semibold text-gray-900">
                  Email Notifications
                </legend>
                <div className="mt-6 space-y-6">
                  <div className="flex gap-3">
                    <div className="flex h-6 shrink-0 items-center">
                      <input
                        id="jobAlertsTurnedOn"
                        name="jobAlertsTurnedOn"
                        type="checkbox"
                        checked={formData.jobAlertsTurnedOn}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm/6">
                      <label
                        htmlFor="jobAlertsTurnedOn"
                        className="font-medium text-gray-900"
                      >
                        Job Alerts
                      </label>
                      <p className="text-gray-500">
                        Get notified about new job opportunities within your
                        area.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex h-6 shrink-0 items-center">
                      <input
                        id="applicationAlertsTurnedOn"
                        name="applicationAlertsTurnedOn"
                        type="checkbox"
                        checked={formData.applicationAlertsTurnedOn}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm/6">
                      <label
                        htmlFor="applicationAlertsTurnedOn"
                        className="font-medium text-gray-900"
                      >
                        Application Alerts
                      </label>
                      <p className="text-gray-500">
                        Get notified about your business's applications.
                      </p>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>

          {/* Personal info section action buttons */}
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
            <button
              type="button"
              onClick={() => {
                if (originalData) {
                  setFormData({
                    ...formData,
                    firstName: originalData.firstName,
                    lastName: originalData.lastName,
                    email: originalData.email,
                    country: originalData.country,
                    streetAddress: originalData.streetAddress,
                    city: originalData.city,
                    county: originalData.county,
                    postalCode: originalData.postalCode,
                    jobAlertsTurnedOn: originalData.jobAlertsTurnedOn,
                    applicationAlertsTurnedOn:
                      originalData.applicationAlertsTurnedOn,
                    skills: originalData.skills,
                  });
                  setSuccess("");
                  setError("");
                }
              }}
              className="text-sm/6 font-semibold text-gray-900 cursor-pointer"
            >
              Reset Personal Info
            </button>
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                setError("");
                setSuccess("");

                try {
                  const db = getDatabase();
                  const userRef = ref(db, "users/" + currentUser.uid);

                  await update(userRef, {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    country: formData.country,
                    streetAddress: formData.streetAddress,
                    city: formData.city,
                    county: formData.county,
                    postalCode: formData.postalCode,
                    jobAlertsTurnedOn: formData.jobAlertsTurnedOn,
                    applicationAlertsTurnedOn:
                      formData.applicationAlertsTurnedOn,
                    skills: formData.skills,
                    mobile: formData.mobile,
                    lastUpdated: new Date().toISOString(),
                  });
                  setOriginalData({
                    ...originalData,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    country: formData.country,
                    streetAddress: formData.streetAddress,
                    city: formData.city,
                    county: formData.county,
                    postalCode: formData.postalCode,
                    jobAlertsTurnedOn: formData.jobAlertsTurnedOn,
                    applicationAlertsTurnedOn:
                      formData.applicationAlertsTurnedOn,
                    skills: formData.skills,
                    mobile: formData.mobile,
                  });
                  setSuccess("Personal information updated successfully!");
                } catch (error) {
                  setError(
                    error.message || "Failed to update personal information"
                  );
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Personal Info"}
            </button>
          </div>
        </div>
      </div>

      {/* Error and success messages using UploadAlert */}
      <div className="sticky bottom-0 w-full flex flex-col gap-2 p-4">
        {error && (
          <UploadAlert
            message={error}
            color="red"
            onClose={() => setError("")}
          />
        )}
        {success && (
          <UploadAlert
            message={success}
            color="green"
            onClose={() => setSuccess("")}
          />
        )}
      </div>
    </div>
  );
}

"use client";
import userPhoto from "../../assets/user.png";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useAuth } from "../../contexts/AuthContext";
import {
  getDatabase,
  ref,
  onValue,
  update,
  set,
  get,
  remove,
} from "firebase/database";
import { deleteAllUserData, updateUserPassword } from "../../firebase/firebase";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  generateUsername,
  usernameCheck,
  validateUsername,
} from "../../utils/usernameCheck";
import {
  uploadFileToStorage,
  deleteFileByUrl,
  moveFileToNewPath,
} from "../../services/storageService";
import { getFileNameFromStoragePath } from "../../utils/fileHelpers";
import UploadAlert from "../../components/User/UserSettings/UploadAlert";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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

const themes = [
  { id: 1, color: "amber", name: "Amber" },
  { id: 2, color: "blue", name: "Blue" },
  { id: 3, color: "cyan", name: "Cyan" },
  { id: 4, color: "emerald", name: "Emerald" },
  { id: 5, color: "fuchsia", name: "Fuchsia" },
  { id: 6, color: "gray", name: "Gray" },
  { id: 7, color: "green", name: "Green" },
  { id: 8, color: "indigo", name: "Indigo" },
  { id: 9, color: "lime", name: "Lime" },
  { id: 10, color: "neutral", name: "Neutral" },
  { id: 11, color: "orange", name: "Orange" },
  { id: 12, color: "pink", name: "Pink" },
  { id: 13, color: "purple", name: "Purple" },
  { id: 14, color: "red", name: "Red" },
  { id: 15, color: "rose", name: "Rose" },
  { id: 16, color: "sky", name: "Sky" },
  { id: 17, color: "slate", name: "Slate" },
  { id: 18, color: "stone", name: "Stone" },
  { id: 19, color: "teal", name: "Teal" },
  { id: 20, color: "violet", name: "Violet" },
  { id: 21, color: "yellow", name: "Yellow" },
  { id: 22, color: "zinc", name: "Zinc" },
];

// UserSettings component for comprehensive user profile and account management
// Features profile editing, file uploads, password changes, and notification preferences
export default function UserSettings() {
  const navigate = useNavigate();
  // Get the current user from AuthContext
  const { currentUser } = useAuth();
  // State for loading, error, and success messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Store the original data for reset functionality
  const [originalData, setOriginalData] = useState(null);
  const [selectedOccupation, setSelectedOccupation] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  // Form state for all user fields
  const [profileFormData, setProfileFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    about: "",
    oneLine: "",
    occupation: "",
    skills: [],
    qualifications: [],
    experience: [],
    profilePicture: "",
    avatar: "",
    theme: "",
    coverPhoto: "",
  });

  const [personalFormData, setPersonalFormData] = useState({
    email: "",
    mobile: "",
    country: "United Kingdom",
    streetAddress: "",
    city: "",
    county: "",
    postalCode: "",
  });

  const [notificationsFormData, setNotificationsFormData] = useState({
    jobAlertsTurnedOn: true,
    applicationAlertsTurnedOn: true,
  });

  // Add state for new skill input
  const [newSkill, setNewSkill] = useState("");

  // Add state for new qualification input
  const [newQualification, setNewQualification] = useState("");
  const [newQualificationDate, setNewQualificationDate] = useState("");

  // Add state for new experience input
  const [newExperienceCompany, setNewExperienceCompany] = useState("");
  const [newExperienceRole, setNewExperienceRole] = useState("");
  const [newExperienceStartDate, setNewExperienceStartDate] = useState("");
  const [newExperienceEndDate, setNewExperienceEndDate] = useState("");
  const [newExperiencePosition, setNewExperiencePosition] =
    useState("Full-time");
  const [isCurrentPosition, setIsCurrentPosition] = useState(false);

  // Password change state
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user data from the database when the component mounts or user changes
  useEffect(() => {
    if (!currentUser) return;

    const db = getDatabase();
    const profileRef = ref(db, "users/" + currentUser.uid + "/profile");
    const personalRef = ref(db, "users/" + currentUser.uid + "/personal");
    const notificationsRef = ref(
      db,
      "users/" + currentUser.uid + "/notifications"
    );

    // Load profile
    get(profileRef).then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProfileFormData((prev) => ({
          ...prev,
          ...data,
          // Ensure arrays are properly initialized
          skills: data.skills || [],
          qualifications: data.qualifications || [],
          experience: data.experience || [],
        }));
        setOriginalData(data);
        if (data.occupation) {
          const matchingOccupation = occupations.find(
            (occ) => occ.name === data.occupation
          );
          setSelectedOccupation(matchingOccupation || null);
        }
        // Set selectedTheme based on the theme value from the database
        if (data.theme) {
          const matchingTheme = themes.find((t) => t.color === data.theme);
          setSelectedTheme(matchingTheme || themes[0]);
        }
      }
    });
    // Load personal
    get(personalRef).then((snapshot) => {
      const data = snapshot.val();
      if (data) setPersonalFormData((prev) => ({ ...prev, ...data }));
    });
    // Load notifications
    get(notificationsRef).then((snapshot) => {
      const data = snapshot.val();
      if (data) setNotificationsFormData((prev) => ({ ...prev, ...data }));
    });

    // Set loaded state after all data has been fetched
    Promise.all([
      get(profileRef),
      get(personalRef),
      get(notificationsRef),
    ]).then(() => {
      setTimeout(() => setIsLoaded(true), 200);
    });
  }, [currentUser]);

  // Handle changes to profile form inputs
  const handleProfileChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "profilePicture" || name === "coverPhoto") {
      setProfileFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setProfileFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };
  // Handle changes to personal form inputs
  const handlePersonalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPersonalFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  // Handle changes to notifications form inputs
  const handleNotificationsChange = (e) => {
    const { name, checked } = e.target;
    setNotificationsFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle adding a new skill
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !profileFormData.skills.includes(newSkill.trim())) {
      setProfileFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  // Handle removing a skill
  const handleRemoveSkill = (skillToRemove) => {
    setProfileFormData((prev) => ({
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

  // Add new qualification to the list
  const handleAddQualification = () => {
    if (newQualification.trim() && newQualificationDate) {
      const qualification = {
        name: newQualification.trim(),
        date: newQualificationDate,
      };
      setProfileFormData((prev) => ({
        ...prev,
        qualifications: [...prev.qualifications, qualification],
      }));
      setNewQualification("");
      setNewQualificationDate("");
    }
  };

  // Remove qualification from the list
  const handleRemoveQualification = (qualificationToRemove) => {
    setProfileFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter(
        (qual) =>
          qual.name !== qualificationToRemove.name ||
          qual.date !== qualificationToRemove.date
      ),
    }));
  };

  // Add new experience to the list
  const handleAddExperience = () => {
    if (
      newExperienceCompany.trim() &&
      newExperienceRole.trim() &&
      newExperienceStartDate
    ) {
      const experience = {
        id: Date.now(), // Simple ID generation
        name: newExperienceCompany.trim(),
        role: newExperienceRole.trim(),
        startDate: newExperienceStartDate,
        endDate: isCurrentPosition ? "Present" : newExperienceEndDate,
        position: newExperiencePosition,
      };

      // Adding new experience to profile

      setProfileFormData((prev) => {
        const newState = {
          ...prev,
          experience: [...(prev.experience || []), experience],
        };
        // New profile state updated
        return newState;
      });

      setNewExperienceCompany("");
      setNewExperienceRole("");
      setNewExperienceStartDate("");
      setNewExperienceEndDate("");
      setNewExperiencePosition("Full-time");
      setIsCurrentPosition(false);
    }
  };

  // Remove experience from the list
  const handleRemoveExperience = (experienceToRemove) => {
    setProfileFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter(
        (exp) => exp.id !== experienceToRemove.id
      ),
    }));
  };

  // Handle profile section submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Username validation using utils
      const validation = validateUsername(profileFormData.username);
      if (!validation.valid) {
        setError(validation.error);
        setLoading(false);
        return;
      }

      const db = getDatabase();
      const userProfileRef = ref(db, "users/" + currentUser.uid + "/profile");

      // Check if username has changed
      const profileSnapshot = await get(userProfileRef);
      const currentProfile = profileSnapshot.val();
      const usernameChanged =
        currentProfile?.username !== profileFormData.username;

      // If username changed, check if new username is available
      if (usernameChanged) {
        const isUsernameTaken = await usernameCheck(profileFormData.username);
        if (isUsernameTaken) {
          setError("This username is already taken");
          setLoading(false);
          return;
        }

        // Update username mapping
        const oldUsernameRef = ref(db, `usernames/${currentProfile.username}`);
        const newUsernameRef = ref(db, `usernames/${profileFormData.username}`);

        // Remove old username mapping and add new one
        await Promise.all([
          remove(oldUsernameRef),
          set(newUsernameRef, currentUser.uid),
        ]);
      }

      let newProfilePictureURL = profileFormData.profilePicture;
      let newCoverPhotoURL = profileFormData.coverPhoto;

      // --- PROFILE PICTURE UPLOAD/UPDATE LOGIC ---
      if (
        profileFormData.profilePicture &&
        profileFormData.profilePicture instanceof File
      ) {
        newProfilePictureURL = await uploadFileToStorage(
          `users/${currentUser.uid}/profile/${profileFormData.profilePicture.name}`,
          profileFormData.profilePicture
        );
      }

      // --- COVER PHOTO UPLOAD/UPDATE LOGIC ---
      if (
        profileFormData.coverPhoto &&
        profileFormData.coverPhoto instanceof File
      ) {
        newCoverPhotoURL = await uploadFileToStorage(
          `users/${currentUser.uid}/cover/${profileFormData.coverPhoto.name}`,
          profileFormData.coverPhoto
        );
      }

      const updateData = {
        ...profileFormData,
        occupation: selectedOccupation?.name || profileFormData.occupation,
        oneLine: profileFormData.oneLine,
        skills: profileFormData.skills,
        qualifications: profileFormData.qualifications,
        experience: profileFormData.experience,
        about: profileFormData.about,
        profilePicture: newProfilePictureURL,
        coverPhoto: newCoverPhotoURL,
        theme: selectedTheme.color,
        lastUpdated: new Date().toISOString(),
      };

      // Updating profile with data

      await update(userProfileRef, updateData);

      setSuccess("Profile settings updated successfully!");
    } catch (error) {
      setError(error.message || "Failed to update profile settings");
    } finally {
      setLoading(false);
    }
  };

  // Handle personal section submission
  const handlePersonalSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const db = getDatabase();
      const userPersonalRef = ref(db, "users/" + currentUser.uid + "/personal");
      await update(userPersonalRef, {
        ...personalFormData,
        lastUpdated: new Date().toISOString(),
      });
      setSuccess("Personal information updated successfully!");
    } catch (error) {
      setError(error.message || "Failed to update personal information");
    } finally {
      setLoading(false);
    }
  };

  // Handle notifications section submission
  const handleNotificationsSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const db = getDatabase();
      const userNotificationsRef = ref(
        db,
        "users/" + currentUser.uid + "/notifications"
      );
      await update(userNotificationsRef, {
        ...notificationsFormData,
        lastUpdated: new Date().toISOString(),
      });
      setSuccess("Notification settings updated successfully!");
    } catch (error) {
      setError(error.message || "Failed to update notification settings");
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle password submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    // Validate password length
    if (passwordFormData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      await updateUserPassword(
        currentUser,
        passwordFormData.currentPassword,
        passwordFormData.newPassword
      );

      setPasswordSuccess("Password updated successfully!");
      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordError(error.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Reset profile section
  const handleProfileReset = () => {
    if (originalData) {
      setProfileFormData({
        ...profileFormData,
        ...originalData,
        username: originalData.username,
        about: originalData.about,
        oneLine: originalData.oneLine,
        profilePicture: originalData.profilePicture,
        coverPhoto: originalData.coverPhoto,
        occupation: originalData.occupation,
        skills: originalData.skills,
        qualifications: originalData.qualifications || [],
        experience: originalData.experience || [],
        avatar: originalData.avatar,
        theme: originalData.theme,
        firstName: originalData.firstName,
        lastName: originalData.lastName,
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
    <div className=" my-10 mx-10">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-10">
          Settings
        </h2>
      </div>
      <div
        className={`grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3 transition-all duration-700 ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="px-4 sm:px-0">
          <h2 className="text-base/7 font-semibold text-gray-900">Profile</h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            This information will be displayed publicly so be careful what you
            share.
          </p>
        </div>

        <form
          onSubmit={handleProfileSubmit}
          className="bg-white shadow-xs ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2 overflow-visible"
        >
          <div className="px-4 py-6 sm:p-8 overflow-visible">
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 overflow-visible">
              {/* Username field with uniqueness check */}
              <div className="sm:col-span-4">
                <label
                  htmlFor="username"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Username{" "}
                  <span className="text-xs text-gray-500">
                    (we recommend using a nickname!)
                  </span>
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
                      value={profileFormData.username}
                      onChange={handleProfileChange}
                      className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 appearance-none"
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
                    value={profileFormData.about}
                    onChange={handleProfileChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none"
                  />
                </div>
                <p className="mt-3 text-sm/6 text-gray-600">
                  Write a few sentences about yourself.
                </p>
              </div>

              {/* One line field */}
              <div className="col-span-full">
                <label
                  htmlFor="oneLine"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  One liner
                </label>
                <div className="mt-2">
                  <input
                    id="oneLine"
                    name="oneLine"
                    type="text"
                    value={profileFormData.oneLine}
                    onChange={handleProfileChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none"
                  />
                </div>
                <p className="mt-3 text-sm/6 text-gray-600">
                  Write a one line description of yourself.
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
                    <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none">
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
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a skill"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none"
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
                    {profileFormData.skills.map((skill) => (
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

              {/* Qualifications field */}
              <div className="col-span-full">
                <label
                  htmlFor="qualifications"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Qualifications
                </label>
                <div className="mt-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={newQualification}
                      onChange={(e) => setNewQualification(e.target.value)}
                      placeholder="Qualification name"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none"
                    />
                    <input
                      type="date"
                      value={newQualificationDate}
                      onChange={(e) => setNewQualificationDate(e.target.value)}
                      className="block w-full sm:w-48 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddQualification}
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profileFormData.qualifications.map(
                      (qualification, index) => (
                        <span
                          key={`${qualification.name}-${index}`}
                          className="inline-flex items-center gap-x-0.5 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                        >
                          {qualification.name} ({qualification.date})
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveQualification(qualification)
                            }
                            className="group relative -mr-1 size-3.5 rounded-xs hover:bg-blue-600/20"
                          >
                            <span className="sr-only">Remove</span>
                            <svg
                              viewBox="0 0 14 14"
                              className="size-3.5 stroke-blue-800/50 group-hover:stroke-blue-800/75"
                            >
                              <path d="M4 4l6 6m0-6l-6 6" />
                            </svg>
                            <span className="absolute -inset-1" />
                          </button>
                        </span>
                      )
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm/6 text-gray-600">
                  Add your qualifications and certifications with the date
                  obtained.
                </p>
              </div>

              {/* Experience field */}
              <div className="col-span-full">
                <label
                  htmlFor="experience"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Work Experience
                </label>
                <div className="mt-2 space-y-3">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newExperienceCompany}
                      onChange={(e) => setNewExperienceCompany(e.target.value)}
                      placeholder="Company name"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none border border-gray-300 focus:border-indigo-600"
                    />
                    <input
                      type="text"
                      value={newExperienceRole}
                      onChange={(e) => setNewExperienceRole(e.target.value)}
                      placeholder="Job role"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none border border-gray-300 focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-3">
                    <input
                      type="date"
                      value={newExperienceStartDate}
                      onChange={(e) =>
                        setNewExperienceStartDate(e.target.value)
                      }
                      placeholder="Start date"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none border border-gray-300 focus:border-indigo-600"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isCurrentPosition"
                        checked={isCurrentPosition}
                        onChange={(e) => {
                          setIsCurrentPosition(e.target.checked);
                          if (e.target.checked) {
                            setNewExperienceEndDate("");
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <label
                        htmlFor="isCurrentPosition"
                        className="text-sm text-gray-700"
                      >
                        Current position
                      </label>
                    </div>
                    <input
                      type="date"
                      value={newExperienceEndDate}
                      onChange={(e) => setNewExperienceEndDate(e.target.value)}
                      disabled={isCurrentPosition}
                      placeholder="End date"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none border border-gray-300 focus:border-indigo-600 disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200"
                    />
                    <select
                      value={newExperiencePosition}
                      onChange={(e) => setNewExperiencePosition(e.target.value)}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none border border-gray-300 focus:border-indigo-600"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Casual">Casual</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Add Experience
                  </button>
                  <div className="mt-3 space-y-2">
                    {profileFormData.experience.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {exp.name}
                          </p>
                          <p className="text-sm text-gray-600">{exp.role}</p>
                          <p className="text-xs text-gray-500">
                            {exp.startDate} - {exp.endDate} • {exp.position}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(exp)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm/6 text-gray-600">
                  Add your work experience in the hospitality industry.
                </p>
              </div>

              {/* Profile picture upload and preview */}
              <div className="col-span-full">
                <label
                  htmlFor="avatar"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Avatar
                </label>
                <div className="mt-2 flex items-center gap-x-3">
                  <img
                    src={profileFormData.avatar}
                    aria-hidden="true"
                    className="size-12 rounded-full text-gray-300 object-cover"
                  />
                  <button
                    type="button"
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                    onClick={() => {
                      const randomSeed = Math.random()
                        .toString(36)
                        .substring(2, 15);
                      const randomAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${randomSeed}`;
                      setProfileFormData((prev) => ({
                        ...prev,
                        avatar: randomAvatar,
                      }));
                    }}
                  >
                    Generate avatar
                  </button>
                </div>
              </div>

              {/* Profile picture upload and preview */}
              <div className="col-span-full">
                <label
                  htmlFor="profile-picture"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Profile picture{" "}
                  <span className="text-xs text-gray-500">
                    (will only be visable to past employers)
                  </span>
                </label>
                <div className="mt-2 flex items-center gap-x-3">
                  <img
                    src={
                      profileFormData.profilePicture instanceof File
                        ? URL.createObjectURL(profileFormData.profilePicture)
                        : profileFormData.profilePicture || userPhoto
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
                    onChange={handleProfileChange}
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
                    {getFileNameFromStoragePath(profileFormData.profilePicture)}
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
                        profileFormData.coverPhoto instanceof File
                          ? URL.createObjectURL(profileFormData.coverPhoto)
                          : profileFormData.coverPhoto || userPhoto
                      }
                      aria-hidden="true"
                      className="mx-auto h-32 w-full max-w-md rounded-lg object-cover text-gray-300"
                    />
                    <div className="mt-4 flex text-sm/6 text-gray-600">
                      <button
                        type="button"
                        onClick={() => {
                          // Generate a random seed for a unique but consistent cover photo
                          const randomSeed = Math.random()
                            .toString(36)
                            .substring(2, 15);
                          const randomCoverPhoto = `https://picsum.photos/seed/${randomSeed}/1200/300`;
                          setProfileFormData((prev) => ({
                            ...prev,
                            coverPhoto: randomCoverPhoto,
                          }));
                        }}
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 focus-within:outline-hidden hover:text-indigo-500"
                      >
                        <span className="text-center">
                          Generate cover photo
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Theme */}
              <div className="sm:col-span-4">
                <Listbox value={selectedTheme} onChange={setSelectedTheme}>
                  <Label className="block text-sm/6 font-medium text-gray-900">
                    Profile Theme
                  </Label>
                  <div className="relative mt-2">
                    <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none">
                      <span className="col-start-1 row-start-1 truncate pr-6">
                        {selectedTheme?.color
                          ? selectedTheme.color.charAt(0).toUpperCase() +
                            selectedTheme.color.slice(1)
                          : ""}
                      </span>
                      <ChevronUpDownIcon
                        aria-hidden="true"
                        className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                      />
                    </ListboxButton>

                    <ListboxOptions
                      transition
                      className="absolute z-[9999] mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
                    >
                      {themes.map((theme) => (
                        <ListboxOption
                          key={theme.color}
                          value={theme}
                          className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
                        >
                          <span className="block truncate font-normal group-data-selected:font-semibold">
                            {theme.color.charAt(0).toUpperCase() +
                              theme.color.slice(1)}
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
      <div
        className={`grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3 transition-all duration-700 ease-out delay-200 mt-24 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="px-4 sm:px-0">
          <h2 className="text-base/7 font-semibold text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            This information is private and used for your account and
            communication. Your first and last name will only be visable to
            employers you have worked for.
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
                  value={profileFormData.firstName}
                  onChange={handlePersonalChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none"
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
                  value={profileFormData.lastName}
                  onChange={handlePersonalChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none"
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
                  {personalFormData.email}
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
                  value={personalFormData.mobile}
                  onChange={handlePersonalChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none"
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
                <div className="relative">
                  <select
                    id="country"
                    name="country"
                    autoComplete="country-name"
                    value={personalFormData.country}
                    onChange={handlePersonalChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 sm:max-w-xs sm:text-sm/6 appearance-none"
                  >
                    <option>United Kingdom</option>
                    <option>United States</option>
                    <option>Canada</option>
                    <option>Australia</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M7 8l3 3 3-3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
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
                  value={personalFormData.streetAddress}
                  onChange={handlePersonalChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none"
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
                  value={personalFormData.city}
                  onChange={handlePersonalChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none"
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
                  value={personalFormData.county}
                  onChange={handlePersonalChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none"
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
                  value={personalFormData.postalCode}
                  onChange={handlePersonalChange}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none"
                />
              </div>
            </div>
          </div>

          {/* Personal info section action buttons */}
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
            <button
              type="button"
              onClick={() => {
                if (originalData) {
                  setPersonalFormData({
                    ...personalFormData,
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
              onClick={handlePersonalSubmit}
              disabled={loading}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Personal Info"}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div
        className={`grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3 transition-all duration-700 ease-out delay-400 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="px-4 sm:px-0">
          <h2 className="text-base/7 font-semibold text-gray-900">
            Notification Settings
          </h2>
          <p className="mt-1 text-sm/6 text-gray-600">
            Manage your notification preferences.
          </p>
        </div>
        <div className="bg-white shadow-xs ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* Job Alerts */}
            <div className="col-span-full">
              <fieldset>
                <legend className="text-sm/6 font-semibold text-gray-900">
                  Job Alerts
                </legend>
                <div className="mt-6 space-y-6">
                  <div className="flex gap-3">
                    <div className="flex h-6 shrink-0 items-center">
                      <input
                        id="jobAlertsTurnedOn"
                        name="jobAlertsTurnedOn"
                        type="checkbox"
                        checked={notificationsFormData.jobAlertsTurnedOn}
                        onChange={handleNotificationsChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm/6">
                      <label
                        htmlFor="jobAlertsTurnedOn"
                        className="font-medium text-gray-900"
                      >
                        Get notified about new job opportunities within your
                        field of work and location.
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
            {/* Application Alerts */}
            <div className="col-span-full">
              <fieldset>
                <legend className="text-sm/6 font-semibold text-gray-900">
                  Application Alerts
                </legend>
                <div className="mt-6 space-y-6">
                  <div className="flex gap-3">
                    <div className="flex h-6 shrink-0 items-center">
                      <input
                        id="applicationAlertsTurnedOn"
                        name="applicationAlertsTurnedOn"
                        type="checkbox"
                        checked={
                          notificationsFormData.applicationAlertsTurnedOn
                        }
                        onChange={handleNotificationsChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="text-sm/6">
                      <label
                        htmlFor="applicationAlertsTurnedOn"
                        className="font-medium text-gray-900"
                      >
                        Get notified when people apply to your job postings.
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>

          {/* Notifications section action buttons */}
          <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
            <button
              type="button"
              onClick={handleNotificationsSubmit}
              disabled={loading}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Notification Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Section - Only show for non-Google users */}
      {currentUser?.providerData?.[0]?.providerId !== "google.com" && (
        <div
          className={`grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3 transition-all duration-700 ease-out delay-600 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="px-4 sm:px-0">
            <h2 className="text-base/7 font-semibold text-gray-900">
              Change Password
            </h2>
            <p className="mt-1 text-sm/6 text-gray-600">
              Update your password to keep your account secure.
            </p>
          </div>
          <div className="bg-white shadow-xs ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <form onSubmit={handlePasswordSubmit}>
              <div className="px-4 py-6 sm:p-8 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                {/* Current Password */}
                <div className="sm:col-span-4">
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    Current Password
                  </label>
                  <div className="mt-2">
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      required
                      value={passwordFormData.currentPassword}
                      onChange={handlePasswordChange}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none"
                      placeholder="Enter your current password"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="sm:col-span-4">
                  <label
                    htmlFor="newPassword"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    New Password
                  </label>
                  <div className="mt-2">
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      required
                      value={passwordFormData.newPassword}
                      onChange={handlePasswordChange}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none"
                      placeholder="Enter your new password"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Password must be at least 6 characters long.
                  </p>
                </div>

                {/* Confirm New Password */}
                <div className="sm:col-span-4">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    Confirm New Password
                  </label>
                  <div className="mt-2">
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      required
                      value={passwordFormData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 appearance-none"
                      placeholder="Re-enter your new password"
                    />
                  </div>
                </div>
              </div>

              {/* Password change section action buttons */}
              <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>

            {/* Password change error and success messages */}
            {passwordError && (
              <div className="px-4 pb-4 sm:px-8">
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{passwordError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {passwordSuccess && (
              <div className="px-4 pb-4 sm:px-8">
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.53a.75.75 0 00-1.06 1.06l2 3a.75.75 0 001.137.089l4-4.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">
                        {passwordSuccess}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={`bg-white mt-5 mb-5 transition-all duration-700 ease-out delay-800 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="py-0 sm:p-0">
          <div className="sm:flex sm:items-start sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Delete Account
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Permanently delete your account and personal data. We reserve
                  the right to keep records of shifts you have worked through
                  Barbid for a limited time. This action is irreversible.
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-5 sm:mt-0 sm:ml-6 sm:block">
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(true)}
                className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Dialog
          open={showDeleteAccountModal}
          onClose={setShowDeleteAccountModal}
          className="relative z-10"
        >
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
          />

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel
                transition
                className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
              >
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                    <ExclamationTriangleIcon
                      aria-hidden="true"
                      className="size-6 text-red-600"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold text-gray-900"
                    >
                      Delete account
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete your account? All of
                        your personal data will be permanently removed from our
                        servers forever. We reserve the right to keep records of
                        shifts you have worked through Barbid for a limited
                        time. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={async () => {
                      setShowDeleteAccountModal(false);
                      await deleteAllUserData(
                        currentUser.uid,
                        profileFormData.username
                      );
                      navigate("/", { replace: true });
                    }}
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                  >
                    Delete Account
                  </button>
                  <button
                    type="button"
                    data-autofocus
                    onClick={() => setShowDeleteAccountModal(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </div>

      {/* Error and success messages using UploadAlert */}
      <div
        className={`sticky bottom-0 w-full flex flex-col gap-2 p-4 transition-all duration-700 ease-out delay-1000 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
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

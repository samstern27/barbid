import { useAuth } from "../../contexts/AuthContext";
import { getDatabase, ref, onValue } from "firebase/database";
import { useState, useEffect } from "react";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import { writeUserData } from "../../firebase/firebase";

const UserProfile = () => {
  const { currentUser } = useAuth();
  console.log(currentUser);
  const [userData, setUserData] = useState(null);
  const [fullNameEditing, setFullNameEditing] = useState(false);
  const [emailEditing, setEmailEditing] = useState(false);
  const [contactNumberEditing, setContactNumberEditing] = useState(false);
  const [occupationEditing, setOccupationEditing] = useState(false);
  const [skillsEditing, setSkillsEditing] = useState(false);
  const [aboutEditing, setAboutEditing] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const reference = ref(db, "users/" + currentUser?.uid);
    onValue(reference, (snapshot) => {
      const data = snapshot.val();
      setUserData(data);
    });
  }, [currentUser]);

  console.log(userData);
  return (
    <>
      <div className="px-4 sm:px-0">
        <h3 className="text-base/7 font-semibold text-gray-900">My Profile</h3>
        <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">
          Manage your profile information and preferences.
        </p>
      </div>
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Full name</dt>
            <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <span className="grow">
                {fullNameEditing ? (
                  <input
                    className="block w-1/2 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    type="text"
                    value={userData?.username}
                    onChange={(e) => {
                      setUserData({ ...userData, username: e.target.value });
                    }}
                  />
                ) : (
                  userData?.username
                )}
              </span>
              <span className="ml-4 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (fullNameEditing) {
                      writeUserData(
                        currentUser?.uid,
                        userData?.username,
                        userData?.email,
                        userData?.phoneNumber,
                        userData?.occupation,
                        userData?.skills,
                        userData?.about
                      );
                    }
                    setFullNameEditing(!fullNameEditing);
                  }}
                  className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {fullNameEditing ? "Save" : "Update"}
                </button>
              </span>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">
              Email address
            </dt>
            <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <span className="grow">
                {emailEditing ? (
                  <input
                    type="text"
                    value={userData?.email}
                    onChange={(e) => {
                      setUserData({ ...userData, email: e.target.value });
                    }}
                  />
                ) : (
                  userData?.email
                )}
              </span>
              <span className="ml-4 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEmailEditing(!emailEditing);
                  }}
                  className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Update
                </button>
              </span>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">
              Contact number
            </dt>
            <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <span className="grow">{userData?.phoneNumber}</span>
              <span className="ml-4 shrink-0">
                <button
                  type="button"
                  className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={() => {
                    setContactNumberEditing(!contactNumberEditing);
                  }}
                >
                  Update
                </button>
              </span>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Occupation</dt>
            <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <span className="grow">{userData?.occupation}</span>
              <span className="ml-4 shrink-0">
                <button
                  type="button"
                  className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={() => {
                    setOccupationEditing(!occupationEditing);
                  }}
                >
                  Update
                </button>
              </span>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Skills</dt>
            <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <span className="grow">{userData?.skills}</span>
              <span className="ml-4 shrink-0">
                <button
                  type="button"
                  className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={() => {
                    setSkillsEditing(!skillsEditing);
                  }}
                >
                  Update
                </button>
              </span>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">About</dt>
            <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <span className="grow">{userData?.about}</span>
              <span className="ml-4 shrink-0">
                <button
                  type="button"
                  className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={() => {
                    setAboutEditing(!aboutEditing);
                  }}
                >
                  Update
                </button>
              </span>
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Attachments</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              <ul
                role="list"
                className="divide-y divide-gray-100 rounded-md border border-gray-200"
              >
                <li className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">
                  <div className="flex w-0 flex-1 items-center">
                    <PaperClipIcon
                      aria-hidden="true"
                      className="size-5 shrink-0 text-gray-400"
                    />
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">
                        resume_back_end_developer.pdf
                      </span>
                      <span className="shrink-0 text-gray-400">2.4mb</span>
                    </div>
                  </div>
                  <div className="ml-4 flex shrink-0 space-x-4">
                    <button
                      type="button"
                      className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Update
                    </button>
                    <span aria-hidden="true" className="text-gray-200">
                      |
                    </span>
                    <button
                      type="button"
                      className="rounded-md bg-white font-medium text-gray-900 hover:text-gray-800"
                    >
                      Remove
                    </button>
                  </div>
                </li>
                <li className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">
                  <div className="flex w-0 flex-1 items-center">
                    <PaperClipIcon
                      aria-hidden="true"
                      className="size-5 shrink-0 text-gray-400"
                    />
                    <div className="ml-4 flex min-w-0 flex-1 gap-2">
                      <span className="truncate font-medium">
                        coverletter_back_end_developer.pdf
                      </span>
                      <span className="shrink-0 text-gray-400">4.5mb</span>
                    </div>
                  </div>
                  <div className="ml-4 flex shrink-0 space-x-4">
                    <button
                      type="button"
                      className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Update
                    </button>
                    <span aria-hidden="true" className="text-gray-200">
                      |
                    </span>
                    <button
                      type="button"
                      className="rounded-md bg-white font-medium text-gray-900 hover:text-gray-800"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              </ul>
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
};

export default UserProfile;

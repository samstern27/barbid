import { useAuth } from "../../contexts/AuthContext";
import { getDatabase, ref, onValue } from "firebase/database";
import { useState, useEffect } from "react";
import { writeUserData } from "../../firebase/firebase";

import TopBar from "../../components/User/UserProfile/TopBar";
import Skills from "../../components/User/UserProfile/Skills";
import About from "../../components/User/UserProfile/About";
import Experience from "../../components/User/UserProfile/Experience";

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const reference = ref(db, "users/" + currentUser?.uid);
    onValue(reference, (snapshot) => {
      const data = snapshot.val();
      setUserData(data);
    });
  }, [currentUser]);

  const themeClasses = {
    amber: ["bg-amber-100", "text-amber-900", "bg-amber-200", "text-amber-900"],
    blue: ["bg-blue-100", "text-blue-900", "bg-blue-200", "text-blue-900"],
    cyan: ["bg-cyan-100", "text-cyan-900", "bg-cyan-200", "text-cyan-900"],
    emerald: [
      "bg-emerald-100",
      "text-emerald-900",
      "bg-emerald-200",
      "text-emerald-900",
    ],
    fuchsia: [
      "bg-fuchsia-100",
      "text-fuchsia-900",
      "bg-fuchsia-200",
      "text-fuchsia-900",
    ],
    gray: ["bg-gray-100", "text-gray-900", "bg-gray-300", "text-gray-900"],
    green: ["bg-green-100", "text-green-900", "bg-green-200", "text-green-900"],
    indigo: [
      "bg-indigo-100",
      "text-indigo-900",
      "bg-indigo-200",
      "text-indigo-900",
    ],
    lime: ["bg-lime-100", "text-lime-900", "bg-lime-200", "text-lime-900"],
    neutral: [
      "bg-neutral-100",
      "text-neutral-900",
      "bg-neutral-200",
      "text-neutral-900",
    ],
    orange: [
      "bg-orange-100",
      "text-orange-900",
      "bg-orange-200",
      "text-orange-900",
    ],
    pink: ["bg-pink-100", "text-pink-900", "bg-pink-200", "text-pink-900"],
    purple: [
      "bg-purple-100",
      "text-purple-900",
      "bg-purple-200",
      "text-purple-900",
    ],
    red: ["bg-red-100", "text-red-900", "bg-red-200", "text-red-900"],
    rose: ["bg-rose-100", "text-rose-900", "bg-rose-200", "text-rose-900"],
    sky: ["bg-sky-100", "text-sky-900", "bg-sky-200", "text-sky-900"],
    slate: ["bg-slate-100", "text-slate-900", "bg-slate-200", "text-slate-900"],
    stone: ["bg-stone-100", "text-stone-900", "bg-stone-200", "text-stone-900"],
    teal: ["bg-teal-100", "text-teal-900", "bg-teal-200", "text-teal-900"],
    violet: [
      "bg-violet-100",
      "text-violet-900",
      "bg-violet-200",
      "text-violet-900",
    ],
    yellow: [
      "bg-yellow-100",
      "text-yellow-900",
      "bg-yellow-200",
      "text-yellow-900",
    ],
    zinc: ["bg-zinc-100", "text-zinc-900", "bg-zinc-200", "text-zinc-900"],
  };

  const profile = {
    firstName: userData?.profile?.firstName,
    lastName: userData?.profile?.lastName,
    username: userData?.profile?.username,
    occupation: userData?.profile?.occupation,
    skills: userData?.profile?.skills,
    avatar: userData?.profile?.avatar,
    backgroundImage: userData?.profile?.coverPhoto,
    about: userData?.profile?.about,
    theme: userData?.profile?.theme || "gray",
    reviews: userData?.profile?.reviews,
  };

  return (
    <div className={`min-h-screen ${themeClasses[profile.theme][0]}`}>
      <TopBar profile={profile} />
      <div className="mx-0 max-w-5xl px-4 sm:px-6 lg:px-8 -mt-13.5">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          <div className="flex flex-col gap-1 sm:gap-0 w-full lg:w-auto mt-10">
            <About profile={profile} />
            <Skills profile={profile} />
          </div>
          <div className="bg-white w-full lg:w-auto py-10 px-4 sm:px-6 lg:px-8 rounded-lg shadow-md">
            <h3
              className={`text-3xl rounded-lg font-light ${
                themeClasses[profile.theme][1]
              } mx-auto lg:mx-0 text-center lg:text-left mb-10`}
            >
              Experience
            </h3>
            <Experience />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

import { useAuth } from "../../contexts/AuthContext";
import { getDatabase, ref, onValue, get } from "firebase/database";
import { useState, useEffect } from "react";
import { writeUserData } from "../../firebase/firebase";
import { useParams } from "react-router-dom";

import TopBar from "../../components/User/UserProfile/TopBar";
import Skills from "../../components/User/UserProfile/Skills";
import About from "../../components/User/UserProfile/About";
import Experience from "../../components/User/UserProfile/Experience";
import Stats from "../../components/User/UserProfile/Stats";
import Qualifications from "../../components/User/UserProfile/Qualifications";
import BentoGrid from "../../components/User/UserProfile/BentoGrid";

const UserProfile = () => {
  const { currentUser } = useAuth();
  const { username } = useParams();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    if (username) {
      // First, find the user ID by username
      const usernamesRef = ref(db, "usernames/" + username);
      get(usernamesRef).then((snapshot) => {
        if (snapshot.exists()) {
          const userId = snapshot.val();
          // Now fetch the user's profile data
          const userRef = ref(db, "users/" + userId + "/profile");
          onValue(userRef, (profileSnapshot) => {
            const profileData = profileSnapshot.val();
            setUserData({ profile: profileData });
          });
        }
      });
    } else {
      // Fallback to current user's profile
      const userRef = ref(db, "users/" + currentUser?.uid + "/profile");
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        setUserData({ profile: data });
      });
    }
  }, [username, currentUser]);

  const themeClasses = {
    amber: ["bg-amber-900", "text-amber-900", "bg-amber-200", "text-amber-900"],
    blue: ["bg-blue-900", "text-blue-900", "bg-blue-200", "text-blue-900"],
    cyan: ["bg-cyan-900", "text-cyan-900", "bg-cyan-200", "text-cyan-900"],
    emerald: [
      "bg-emerald-900",
      "text-emerald-900",
      "bg-emerald-200",
      "text-emerald-900",
    ],
    fuchsia: [
      "bg-fuchsia-900",
      "text-fuchsia-900",
      "bg-fuchsia-200",
      "text-fuchsia-900",
    ],
    gray: ["bg-gray-900", "text-gray-900", "bg-gray-300", "text-gray-900"],
    green: ["bg-green-900", "text-green-900", "bg-green-200", "text-green-900"],
    indigo: [
      "bg-indigo-900",
      "text-indigo-900",
      "bg-indigo-200",
      "text-indigo-900",
    ],
    lime: ["bg-lime-900", "text-lime-900", "bg-lime-200", "text-lime-900"],
    neutral: [
      "bg-neutral-900",
      "text-neutral-900",
      "bg-neutral-200",
      "text-neutral-900",
    ],
    orange: [
      "bg-orange-900",
      "text-orange-900",
      "bg-orange-200",
      "text-orange-900",
    ],
    pink: ["bg-pink-900", "text-pink-900", "bg-pink-200", "text-pink-900"],
    purple: [
      "bg-purple-900",
      "text-purple-900",
      "bg-purple-200",
      "text-purple-900",
    ],
    red: ["bg-red-900", "text-red-900", "bg-red-200", "text-red-900"],
    rose: ["bg-rose-900", "text-rose-900", "bg-rose-200", "text-rose-900"],
    sky: ["bg-sky-900", "text-sky-900", "bg-sky-200", "text-sky-900"],
    slate: ["bg-slate-900", "text-slate-900", "bg-slate-200", "text-slate-900"],
    stone: ["bg-stone-900", "text-stone-900", "bg-stone-200", "text-stone-900"],
    teal: ["bg-teal-900", "text-teal-900", "bg-teal-200", "text-teal-900"],
    violet: [
      "bg-violet-900",
      "text-violet-900",
      "bg-violet-200",
      "text-violet-900",
    ],
    yellow: [
      "bg-yellow-900",
      "text-yellow-900",
      "bg-yellow-200",
      "text-yellow-900",
    ],
    zinc: ["bg-zinc-900", "text-zinc-900", "bg-zinc-200", "text-zinc-900"],
  };
  console.log(currentUser);
  const profile = {
    firstName: userData?.profile?.firstName,
    lastName: userData?.profile?.lastName,
    username: userData?.profile?.username,
    occupation: userData?.profile?.occupation,
    oneLine: userData?.profile?.oneLine,
    skills: userData?.profile?.skills,
    avatar: userData?.profile?.avatar,
    backgroundImage: userData?.profile?.coverPhoto,
    about: userData?.profile?.about,
    theme: userData?.profile?.theme || "gray",
    reviews: userData?.profile?.reviews,
    id: username || currentUser?.uid,
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-t ${
        themeClasses[profile.theme][0]
      } to-gray-700`}
    >
      <TopBar profile={profile} />
      <Stats profile={profile} />
      <BentoGrid profile={profile} />
    </div>
  );
};

export default UserProfile;

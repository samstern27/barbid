import { useAuth } from "../../contexts/AuthContext";
import { getDatabase, ref, onValue } from "firebase/database";
import { useState, useEffect } from "react";
import { writeUserData } from "../../firebase/firebase";

import TopBar from "../../components/User/UserProfile/TopBar";
import Skills from "../../components/User/UserProfile/Skills";
import About from "../../components/User/UserProfile/About";

const UserProfile = () => {
  const { currentUser } = useAuth();
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

  const themeClasses = {
    amber: "amber",
    blue: "blue",
    cyan: "cyan",
    emerald: "emerald",
    fuchsia: "fuchsia",
    gray: "gray",
    green: "green",
    indigo: "indigo",
    lime: "lime",
    neutral: "neutral",
    orange: "orange",
    pink: "pink",
    purple: "purple",
    red: "red",
    rose: "rose",
    sky: "sky",
    slate: "slate",
    stone: "stone",
    teal: "teal",
    violet: "violet",
    yellow: "yellow",
    zinc: "zinc",
  };

  const themeBackgrounds = {
    amber: "bg-amber-50",
    blue: "bg-blue-50",
    cyan: "bg-cyan-50",
    emerald: "bg-emerald-50",
    fuchsia: "bg-fuchsia-50",
    gray: "bg-gray-50",
    green: "bg-green-50",
    indigo: "bg-indigo-50",
    lime: "bg-lime-50",
    neutral: "bg-neutral-50",
    orange: "bg-orange-50",
    pink: "bg-pink-50",
    purple: "bg-purple-50",
    red: "bg-red-50",
    rose: "bg-rose-50",
    sky: "bg-sky-50",
    slate: "bg-slate-50",
    stone: "bg-stone-50",
    teal: "bg-teal-50",
    violet: "bg-violet-50",
    yellow: "bg-yellow-50",
    zinc: "bg-zinc-50",
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
  };

  const theme = profile.theme || "gray";
  const backgroundClass = themeBackgrounds[theme] || themeBackgrounds.gray;

  return (
    <div className={`h-screen ${backgroundClass}`}>
      <TopBar profile={profile} />
      <About profile={profile} />
      <Skills profile={profile} />
    </div>
  );
};

export default UserProfile;

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
    <div>
      <h1>User Profile</h1>
    </div>
  );
};

export default UserProfile;

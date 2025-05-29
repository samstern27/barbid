import { useAuth } from "../../contexts/AuthContext";
import { getDatabase, ref, onValue } from "firebase/database";
import { useState, useEffect } from "react";

const UserProfile = () => {
  const { currentUser } = useAuth();
  console.log(currentUser);
  const [userData, setUserData] = useState(null);

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
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">{userData?.username}</h1>
      <p className="text-sm text-gray-500">Username: {userData?.username}</p>
      <p className="text-sm text-gray-500">Email: {userData?.email}</p>
      <p className="text-sm text-gray-500">Mobile Number: {userData?.mobile}</p>
    </div>
  );
};

export default UserProfile;

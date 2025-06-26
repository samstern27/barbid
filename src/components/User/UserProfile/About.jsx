import React from "react";

const About = ({ profile }) => {
  const aboutText = profile.about || "";
  console.log(aboutText);
  return (
    <div className="text-gray-600 p-4 flex flex-col text-center gap-4 sm:p-6 sm:text-left lg:p-8 sm:text-wrap">
      <p className="text-sm">{aboutText}</p>
      <div className="flex flex-col gap-2"></div>
    </div>
  );
};

export default About;

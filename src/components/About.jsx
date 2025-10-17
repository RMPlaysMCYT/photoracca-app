import React from "react";
import "../Sponsor.css";

const About = ({ onBack }) => {
  return (
    <div className="sponsor-page">
      <h1>About Us</h1>
      <p>Photoracca App is an Free and Open-source photobooth camera software made with following libraries and frameworks</p>
      <p>This program is also suitable for <br></br> ✅ birthdays<br></br> ✅ parties<br></br> ✅ weddings <br></br> ✅ and special events</p>
      <div className="library-list">
        <h1>Libraries & Frameworks</h1>
        <a href="https://react.dev" target="_blank">ReactJS</a>
        <a href="https://www.npmjs.com/package/file-saver" target="_blank">Save to File</a>
        <a href="https://www.npmjs.com/package/react-webcam" target="_blank">ReactJS Camera</a>
      </div>
      <div>
        <h2>This software Created by Ronnel Mitra</h2>
      </div>
      <button onClick={onBack} className="back-button">
        Back to Home
      </button>
    </div>
  );
};

export default About;

import React from "react";
import "../Sponsor.css";

const SponsorPage = ({ onBack }) => {
  return (
    <div className="sponsor-page">
      <h1>Sponsor Us</h1>
      <p>Support our project development!</p>
      <div className="library-list">
        <h1>Libraries</h1>
        <a>Save to File</a>
        <br></br>
        <a>ReactJS Camera</a>
      </div>
      <button onClick={onBack} className="back-button">
        Back to Home
      </button>
    </div>
  );
};

export default SponsorPage;

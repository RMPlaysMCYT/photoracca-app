import React from "react";
import "../Sponsor.css";

const SponsorPage = ({ onBack }) => {
  return (
    <div className="sponsor-page">
      <h1>Sponsor Us</h1>
      <p>Support our project development!</p>
      <div className="library-list">
        <div>
          You can support us on:
          <br />
          <a href="https://paypal.me/rmplaysmcyt" target="_blank">PayPal</a>
          <img src="" alt="" />
          <img></img>
          <img></img>
        </div>
      </div>
      <button onClick={onBack} className="back-button">
        Back to Home
      </button>
    </div>
  );
};

export default SponsorPage;

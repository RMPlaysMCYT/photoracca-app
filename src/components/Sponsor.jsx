import React from "react";

const SponsorPage = () => {
  const handleBackToHome = () => {
    // Add your logic to navigate back to the Home page
  };

  return (
    <div className="sponsor-page">
      <h1>Sponsor Us</h1>
      <p>Support our project development!</p>
      <button onClick={handleBackToHome} className="back-button">
        Back to Home
      </button>
    </div>
  );
};

export default SponsorPage;
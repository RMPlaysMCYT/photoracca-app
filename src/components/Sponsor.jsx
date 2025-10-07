import React, { Component } from "react";

class SponsorPage extends Component {
  render() {
    return (
      <div className="sponsor-page">
        <h1>Sponsor Us</h1>
        <p>Support our project development!</p>
        <button onClick={Homepage} className="back-button">
          Back to Home
        </button>
      </div>
    );
  }
}

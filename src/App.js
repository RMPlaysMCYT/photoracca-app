import React, { useState } from "react";
import { closeWindow } from "./code_Modules/closeApp";
// import { useWebCamera } from "./code_Modules/webCameraAPI";
import Home from './components/Home';
import SponsorPage from './components/Sponsor';
import About from './components/About';

import "./App.css";
import PhotoraccaLogo from "./assets/pictures/Photoraccalogo.png";
import CloseButton from "./assets/images/closeImage.png";

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="App">
      <div
        className="absolute inset-0 z-[-1]"
        style={{
          height: "100vh",
          backgroundImage: `
            linear-gradient(to right, #f0f0f0 1px, transparent 1px),
            linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),
            radial-gradient(circle 600px at 0% 200px, #d5c5ff, transparent),
            radial-gradient(circle 600px at 100% 200px, #d5c5ff, transparent),
            radial-gradient(circle 600px at 50% 0px, #d5c5ff, transparent),
            radial-gradient(circle 600px at 50% 100%, #d5c5ff, transparent)
          `,
          backgroundSize: `
            96px 64px,    
            96px 64px,    
            100% 100%,    
            100% 100%,
            100% 100%,
            100% 100%`,
        }}
      >
        <div>
          <div className="Header">
            <img className="logo" src={PhotoraccaLogo}/>
            <img className="close-btn" src={CloseButton} onClick={closeWindow}/>
          </div>
          <div className="content">
            {currentPage === "home" && <Home />}
            {currentPage === "sponsor" && (
              <SponsorPage onBack={() => handlePageChange("home")} />
            )}
            {currentPage === "about" && (
              <About onBack={() => handlePageChange("home")} />
            )}
          </div>
          <div className="footerDesign">
            <div className="footerMain">
              <div>© 2025 Ronnel Mitra, Apache License 2.0</div>
              <div className="footerLinks">
                <a 
                  onClick={() => handlePageChange('sponsor')}
                  className={currentPage === 'sponsor' ? 'active' : ''}
                >Sponsor Us</a>
                <a
                  onClick={() => handlePageChange('about')}
                  className={currentPage === 'about' ? 'active' : ''}
                >
                  About
                </a>
                <a href="https://github.com/RMPlaysMCYT/photoracca-app" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="https://github.com/RMPlaysMCYT/photoracca-app/releases" target="_blank" rel="noopener noreferrer">0.3.0 - Alpha</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
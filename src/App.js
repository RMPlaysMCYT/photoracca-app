//Tech modules
import { useState, useRef, useEffect } from "react";
import { closeWindow } from "./code_Modules/closeApp";
import { useWebCamera } from "./code_Modules/webCameraAPI"; // Changed import

import {Switch, Route} from "react-router-dom";

import HomePage from './components/Home';
import Sponsor from './components/Sponsor';

//Pages
// import { SponsorPage } from "./SponsorPage";

//Modules-Image-CSS
import "./App.css";
import PhotoraccaLogo from "./assets/pictures/Photoraccalogo.png";
import CloseButton from "./assets/images/closeImage.png";

function App() {


   const [currentPage, setCurrentPage] = useState('home');

  const {
    videoRef,
    photoReferencial,
    mediaStreamed,
  } = useWebCamera(); // Now using as hook

  return (
    <div className="App">
      <div
        className="absolute inset-0 z-[-1]"
        style={
          {
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
          }
        }
      >
        <body>
        <Switch>
            <Route path="/contact">
              <Contact />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
          <footer className="footerDesign">
            <div className="footerMain">
              <div>© 2025 Ronnel Mitra, Apache License 2.0</div>
              <div className="footerLinks">
                <a 
                  onClick={
                    () => setCurrentPage('SponsorPage')
                  }
                  className={currentPage === 'SponsorPage' ? 'active' : ''} 
                >Sponsor Us</a>
                <a href="https://github.com/RMPlaysMCYT/photoracca-app" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="https://github.com/RMPlaysMCYT/photoracca-app/releases" target="_blank" rel="noopener noreferrer">0.3.0 - Alpha</a>
              </div>
            </div>
          </footer>
        </body>
      </div>
    </div>
  );
}

export default App;
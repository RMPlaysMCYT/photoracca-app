//Tech modules
import { useState, useRef, useEffect } from "react";
import { closeWindow } from "./code_Modules/closeApp";
import { useWebCamera } from "./code_Modules/webCameraAPI"; // Changed import

//Modules-Image-CSS
import "./App.css";
import PhotoraccaLogo from "./assets/pictures/Photoraccalogo.png";
import CloseButton from "./assets/images/closeImage.png";

function App() {
  const {
    videoRef,
    photoReferencial,
    mediaStreamed,
  } = useWebCamera(); // Now using as hook

  return (
    <div className="App">
      <div
        // className="absolute inset-0 z-[-1]"
        className="absolute inset-0 z-0"
        style={
          {
            height: "100vh",
            // backgroundImage: `
            //   linear-gradient(to right, #f0f0f0 1px, transparent 1px),
            //   linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),
            //   radial-gradient(circle 600px at 0% 200px, #d5c5ff, transparent),
            //   radial-gradient(circle 600px at 100% 200px, #d5c5ff, transparent),
            //   radial-gradient(circle 600px at 50% 0px, #d5c5ff, transparent),
            //   radial-gradient(circle 600px at 50% 100%, #d5c5ff, transparent)
            // `,
            // backgroundSize: `
            //   96px 64px,    
            //   96px 64px,    
            //   100% 100%,    
            //   100% 100%,
            //   100% 100%,
            //   100% 100%`,

            background: `
              radial-gradient(ellipse 80% 60% at 5% 40%, rgba(175, 109, 255, 0.48), transparent 67%),
              radial-gradient(ellipse 70% 60% at 45% 45%, rgba(255, 100, 180, 0.41), transparent 67%),
              radial-gradient(ellipse 62% 52% at 83% 76%, rgba(255, 235, 170, 0.44), transparent 63%),
              radial-gradient(ellipse 60% 48% at 75% 20%, rgba(120, 190, 255, 0.36), transparent 66%),
              linear-gradient(45deg, #f7eaff 0%, #fde2ea 100%)
            `,
          }
        }
      >
        <body>
          <main>
            <div className="Header">
              <img className="logo" src={PhotoraccaLogo}/>
              <img className="close-btn" src={CloseButton} onClick={closeWindow}/>
            </div>
              <div className="VideoFrame">
                <video
                className="videoStreamed"
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{}}
                />
                <canvas ref={photoReferencial} style={{ display: 'none' }} />
              </div>
              <div className="cameraButtons">
                <select
                className="modeSelectorBtn"
                  // value={photoMode}
                  // onChange={(e) => {
                  //   setPhotoMode(e.target.value);
                  // }}
                  // disabled={isTakingPhotos}
                >
                  <option value="single">Single Photo</option>
                  <option value="multiple">Multiple Photos</option>
                  <option value="multiple2">Multiple Photos Stripe</option>
                </select>
                <button className="takePhotoBtn">Take a Photo</button>
              </div>
          </main>
          <footer className="footerDesign">
            <div className="footerMain">
              <div>© 2025 Ronnel Mitra, Apache License 2.0</div>
              <div className="footerLinks">
                <a href="https://github.com/RMPlaysMCYT/photoracca-app" target="_blank">GitHub</a>
                <a href="https://github.com/RMPlaysMCYT/photoracca-app/releases" target="_blank">0.3.0 - Alpha</a>
              </div>
            </div>
          </footer>
        </body>
      </div>
    </div>
  );
}

export default App;
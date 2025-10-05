//Tech modules
import React, { useRef, useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { closeWindow } from "./code_Modules/closeApp";

//Modules-Image-CSS
import "./App.css";
import PhotoraccaLogo from "./assets/pictures/Photoraccalogo.png";
import CloseButton from "./assets/images/closeImage.png";

function App() {

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
          <main>
            <div className="Header">
              <img className="logo" src={PhotoraccaLogo}/>
              <img className="close-btn" src={CloseButton} onClick={closeWindow}/>
            </div>
          </main>
        </body>
      </div>
    </div>
  );
}

export default App;
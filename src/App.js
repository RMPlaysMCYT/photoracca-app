//Tech modules
import { useState } from "react";
import { closeWindow } from "./code_Modules/closeApp";
import { useWebCamera } from "./code_Modules/webCameraAPI";
import Webcam from "react-webcam";

//Modules-Image-CSS
import "./App.css";
import PhotoraccaLogo from "./assets/pictures/Photoraccalogo.png";
import CloseButton from "./assets/images/closeImage.png";

function App() {
  const {
    webcamRef,
    facingMode,
    mirrored,
    isCameraOn,
    switchCamera,
    toggleCamera,
    toggleMirror,
    capturePhoto,
    videoConstraints
  } = useWebCamera();

  const [photoMode, setPhotoMode] = useState("single");
  const [capturedImage, setCapturedImage] = useState(null);

  const handleTakePhoto = () => {
    const photo = capturePhoto();
    if (photo) {
      setCapturedImage(photo);
      console.log("Photo captured!");
      // You can add logic here for different photo modes
    }
  };

  return (
    <div className="App">
      <div
        className="absolute inset-0 z-0"
        style={{
          height: "100vh",
          background: `
            radial-gradient(ellipse 80% 60% at 5% 40%, rgba(175, 109, 255, 0.48), transparent 67%),
            radial-gradient(ellipse 70% 60% at 45% 45%, rgba(255, 100, 180, 0.41), transparent 67%),
            radial-gradient(ellipse 62% 52% at 83% 76%, rgba(255, 235, 170, 0.44), transparent 63%),
            radial-gradient(ellipse 60% 48% at 75% 20%, rgba(120, 190, 255, 0.36), transparent 66%),
            linear-gradient(45deg, #f7eaff 0%, #fde2ea 100%)
          `,
        }}
      >
        <main>
          <div className="Header">
            <img className="logo" src={PhotoraccaLogo} alt="Photoracca Logo"/>
            <img className="close-btn" src={CloseButton} onClick={closeWindow} alt="Close"/>
          </div>
          
          <div className="VideoFrame">
            {isCameraOn ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                mirrored={mirrored}
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  borderRadius: '10px'
                }}
              />
            ) : (
              <div className="camera-off-placeholder">
                Camera is off
              </div>
            )}
          </div>

          {/* Camera Control Buttons */}
          <div className="cameraControlButtons">
            <button onClick={switchCamera} className="controlBtn">
              Switch Camera ({facingMode === "user" ? "Front" : "Back"})
            </button>
            <button onClick={toggleMirror} className="controlBtn">
              {mirrored ? "Unmirror" : "Mirror"}
            </button>
            <button onClick={toggleCamera} className="controlBtn">
              {isCameraOn ? "Turn Off" : "Turn On"}
            </button>
          </div>

          <div className="cameraButtons">
            <select
              className="modeSelectorBtn"
              value={photoMode}
              onChange={(e) => setPhotoMode(e.target.value)}
            >
              <option value="single">Single Photo</option>
              <option value="multiple">Multiple Photos</option>
              <option value="multiple2">Multiple Photos Stripe</option>
            </select>
            <button 
              className="takePhotoBtn" 
              onClick={handleTakePhoto}
              disabled={!isCameraOn}
            >
              Take a Photo
            </button>
          </div>

          {/* Display Captured Photo */}
          {capturedImage && (
            <div className="capturedPhotoPreview">
              <h3>Captured Photo:</h3>
              <img src={capturedImage} alt="Captured" style={{ maxWidth: '300px' }} />
              <button onClick={() => setCapturedImage(null)}>Clear</button>
              <button onClick={() => {
                // Save photo functionality
                const link = document.createElement('a');
                link.href = capturedImage;
                link.download = `photoracca-${Date.now()}.jpg`;
                link.click();
              }}>Download</button>
            </div>
          )}
        </main>
        
        <footer className="footerDesign">
          <div className="footerMain">
            <div>© 2025 Ronnel Mitra, Apache License 2.0</div>
            <div className="footerLinks">
              <a href="https://github.com/RMPlaysMCYT/photoracca-app" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://github.com/RMPlaysMCYT/photoracca-app/releases" target="_blank" rel="noopener noreferrer">0.3.0 - Alpha</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
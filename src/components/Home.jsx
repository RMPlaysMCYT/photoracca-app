import React, { useRef, useState } from "react";
import { useWebCamera } from "../code_Modules/webCameraAPI";
import SinglePhoto from "./singlePhoto"; // Make sure to import SinglePhoto
import MultiplePhotoStripe from "./multiplePhotoStripe";
import MultiplePhotoStripeHeight from "./multiplePhotoStripeHeight";

const Home = () => {
  const { videoRef, photoReferencial } = useWebCamera();
  const [currentMode, setCurrentMode] = useState("single");
  const singlePhotoRef = useRef();
  const stripeRef = useRef();

  const handleTakePhoto = () => {
    if (currentMode === "single" && singlePhotoRef.current) {
      singlePhotoRef.current.takePhoto();
    }
    if (currentMode === "multiple" && stripeRef.current) {
      // start the 3s countdown strip capture (up to configured photos)
      stripeRef.current.startStrip();
    }
    if (currentMode === "multiple2" && stripeRef.current) {
      // start the 3s countdown strip capture (up to configured photos)
      stripeRef.current.startStrip();
    }
    // Add other modes here as needed
  };

  const handleModeChange = (event) => {
    setCurrentMode(event.target.value);
  };

  return (
    <main className="Homepage">
      <div className="MainWindow">
        <div className="VideoFrame">
          <video
            className="videoStreamed"
            ref={videoRef}
            autoPlay
            playsInline
          />
          <canvas ref={photoReferencial} style={{ display: "none" }} />
        </div>

        {/* Render the current mode component */}
        {currentMode === "single" && (
          <SinglePhoto 
            ref={singlePhotoRef}
            videoRef={videoRef}
            canvasRef={photoReferencial}
          />
        )}
        {currentMode === "multiple" && (
          <MultiplePhotoStripe
            ref={stripeRef}
            videoRef={videoRef}
            canvasRef={photoReferencial}
            countdown={3}
            maxPhotos={4}
          />
        )}
        {currentMode === "multiple2" && (
          <MultiplePhotoStripeHeight
            ref={stripeRef}
            videoRef={videoRef}
            canvasRef={photoReferencial}
            countdown={3}
            maxPhotos={4}
          />
        )}
        {/* Add other mode components here */}

        <div className="cameraButtons">
          <select 
            className="modeSelectorBtn" 
            value={currentMode}
            onChange={handleModeChange}
          >
            <option value="single">Single Photo</option>
            <option value="multiple">Multiple Photos</option>
            <option value="multiple2">Multiple Photos Stripe</option>
          </select>
          <button className="takePhotoBtn" onClick={handleTakePhoto}>
            Take a Photo
          </button>
        </div>
      </div>
    </main>
  );
};

export default Home;
import React, { useRef, useState, useEffect } from "react";
import { useWebCamera } from "../code_Modules/webCameraAPI";

//Pages
import SinglePhoto from "./singlePhoto"; // Make sure to import SinglePhoto
import MultiplePhotoStripe from "./multiplePhotoStripe";
import MultiplePhotoStripeHeight from "./multiplePhotoStripeHeight";
import MultiplePhotoStandard from "./multiplephotoStandard";

const Home = () => {
  const { videoRef, photoReferencial, deviceId, setDeviceId, facingMode, setFacingMode } = useWebCamera();
  const [devices, setDevices] = useState([]);
  const [CameraSource, setCameraSource] = useState("");
  const [mirrorPreview, setMirrorPreview] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function listDevices() {
      try {
        const all = await navigator.mediaDevices.enumerateDevices();
        const cams = all.filter((d) => d.kind === "videoinput");
        if (!mounted) return;
        setDevices(cams);
        if (cams.length > 0) {
          const preferred = deviceId || cams[0].deviceId;
          setCameraSource(preferred);
          // ensure hook uses this device
          if (!deviceId) setDeviceId(cams[0].deviceId);
        }
      } catch (e) {
        console.warn("Failed to list devices", e);
      }
    }
    listDevices();
    // re-list on devicechange
    navigator.mediaDevices.addEventListener("devicechange", listDevices);
    return () => {
      mounted = false;
      try {
        navigator.mediaDevices.removeEventListener("devicechange", listDevices);
      } catch (e) {}
    };
  }, [deviceId, setDeviceId]);
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
    if (currentMode === "multiple3" && stripeRef.current) {
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
          <div className="ColorBackground">
            <video
            className="videoStreamed"
            ref={videoRef}
            autoPlay
            playsInline
            style={{ transform: mirrorPreview ? 'scaleX(-1)' : 'none' }}
          />
          </div>
          <canvas ref={photoReferencial} style={{ display: "none" }} />
        </div>

        {/* Render the current mode component */}
        {currentMode === "single" && (
          <SinglePhoto 
            ref={singlePhotoRef}
            videoRef={videoRef}
            canvasRef={photoReferencial}
            mirrorPreview={mirrorPreview}
          />
        )}
        {currentMode === "multiple" && (
          <MultiplePhotoStripe
            ref={stripeRef}
            videoRef={videoRef}
            canvasRef={photoReferencial}
            countdown={3}
            maxPhotos={4}
            mirrorPreview={mirrorPreview}
          />
        )}
        {currentMode === "multiple2" && (
          <MultiplePhotoStripeHeight
            ref={stripeRef}
            videoRef={videoRef}
            canvasRef={photoReferencial}
            countdown={3}
            maxPhotos={4}
            mirrorPreview={mirrorPreview}
          />
        )}
        
        {currentMode === "multiple3" && (
          <MultiplePhotoStandard
            ref={stripeRef}
            videoRef={videoRef}
            canvasRef={photoReferencial}
            countdown={3}
            maxPhotos={4}
            mirrorPreview={mirrorPreview}
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
            <option value="multiple3">Multiple Photos Stripe Standard</option>
          </select>
          <select
            className="modeSelectorBtn"
            value={CameraSource}
            onChange={(e) => {
              const id = e.target.value;
              setCameraSource(id);
              
              setFacingMode(null);
              setDeviceId(id);
            }}
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera ${d.deviceId}`}
              </option>
            ))}
          </select>

          <select
            className="modeSelectorBtn"
            value={facingMode || "auto"}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "auto") {
                
                setFacingMode(null);
                return;
              }
              
              setDeviceId(null);
              setFacingMode(val);
            }}
          >
            <option value="auto">Camera: Auto</option>
            <option value="user">Front (user)</option>
            <option value="environment">Back (environment)</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={mirrorPreview} onChange={(e) => setMirrorPreview(e.target.checked)} />
            Mirror Preview
          </label>
          <button className="cameraButtons takePhotoBtn" onClick={handleTakePhoto}>
            Take a Photo
          </button>
        </div>
      </div>
    </main>
  );
};

export default Home;
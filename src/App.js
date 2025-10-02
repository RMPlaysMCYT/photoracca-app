import React, { useRef, useEffect, useState } from "react";
import { saveAs } from "file-saver";

import "./App.css";
// import logo from './logo/PhotoRaccaLogo.png';

import PhotoraccaLogo from "./logo";

function App() {
  const videoRef = useRef(null);
  const photoReferencial = useRef(null);

  const [countdown, setCountdown] = useState(0);

  const [isTakingPhotos, setIsTakingPhotos] = useState(false);

  const [hasPhotoShotted, setHasPhotoShotted] = useState(false);

  const getVideoCameraAPI = () => {
    if (!videoRef.current) return;
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          width: 1280,
          height: 720,
          facingMode: "user",
        },
      })
      .then((stream) => {
        let video = videoRef.current;
        if (!video) return;

        if (video.srcObject) {
          const previousStream = video.srcObject;
          previousStream.getTracks().forEach((track) => track.stop());
        }

        video.srcObject = stream;

        video.setAttribute("playsinline", "true");
        video.setAttribute("webkit-playsinline", "true");

        video.play().catch((err) => {
          console.log(
            "Play interrupted, but this is expected during stream switching"
          );
        });
      })
      .catch((err) => {
        console.error("Error accessing camera:", err);
        const fallbackConstraints = {
          audio: false,
          video: true,
        };
        return navigator.mediaDevices.getUserMedia(fallbackConstraints);
      });
  };

  useEffect(() => {
    getVideoCameraAPI();

    return () => {
      const videoElemetos = videoRef.current;
      if (videoElemetos && videoElemetos.srcObject) {
        const stream = videoElemetos.srcObject;
        stream.getTracks().forEach((track) => track.stop());
        videoElemetos.srcObject = null;
      }
    };
  }, []);

  const TakePhoto = () => {
    const width = 414;
    const height = width / (16 / 9);

    let video = videoRef.current;
    let photo = photoReferencial.current;

    photo.width = width;
    photo.height = height;

    let contextos = photo.getContext("2d");
    if (!contextos) return;

    contextos.drawImage(video, 0, 0, width, height);
    setHasPhotoShotted(true);
  };

  const TakeMultiplePhotosWidth = async () => {
    const video = videoRef.current;
    const photo = photoReferencial.current;

    if (!video || !photo) {
      console.error("Video or photo reference not found");
      return;
    }

    const singleWidth = 414;
    const singleHeight = singleWidth / (16 / 9);

    // Create a larger canvas for the combined image
    const combinedWidth = singleWidth * 3; // 3 images side by side
    const combinedHeight = singleHeight;

    photo.width = combinedWidth;
    photo.height = combinedHeight;

    const context = photo.getContext("2d");
    if (!context) return;

    // Clear the canvas first
    context.clearRect(20, 0, combinedWidth, combinedHeight);

    // Set a background color (optional)
    context.fillStyle = "#ffffff";
    context.fillRect(10, 5, combinedWidth, combinedHeight);

    // Take 3 photos with a small delay between them
    for (let i = 0; i < 3; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 500ms delay

      // Draw each photo at its position
      const xPosition = i * singleWidth;
      context.drawImage(video, xPosition, 0, singleWidth, singleHeight);

      // Optional: Add border between images
      if (i < 2) {
        context.strokeStyle = "#c69999ff";
        context.lineWidth = 10;
        context.lineHeight = 10;
        context.beginPath();
        context.moveTo(xPosition + singleWidth, 0);
        context.lineTo(xPosition + singleWidth, combinedHeight);
        context.stroke();
      }
    }

    setHasPhotoShotted(true);
  };

  const TakeMultiplePhotos2 = async () => {
    const video = videoRef.current;
    const photo = photoReferencial.current;

    if (!video || !photo) {
      console.error("Video or photo reference not found");
      return;
    }

    const singleWidth = 414;
    const singleHeight = singleWidth / (16 / 9);

    // Create a larger canvas for the combined image
    const combinedWidth = singleWidth;
    const combinedHeight = singleHeight * 3;

    photo.width = combinedWidth;
    photo.height = combinedHeight;

    const context = photo.getContext("2d");
    if (!context) return;

    // Clear the canvas first
    context.clearRect(0, 0, combinedWidth, combinedHeight);

    // Set a background color
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, combinedWidth, combinedHeight);

    // Take 3 photos with countdown timer
    for (let i = 0; i < 3; i++) {
      // Countdown from 5 to 1 for each shot
      for (let countdown = 5; countdown > 0; countdown--) {
        console.log(`Shot ${i + 1} in: ${countdown}`);
        setCountdown(countdown);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
      }

      console.log(`Taking shot ${i + 1}!`);

      setCountdown(0);
      
      // Calculate position for each frame
      const yPosition = i * singleHeight; // Fixed: should be singleHeight, not singleWidth

      // Draw frame border first
      context.strokeStyle = "#000000";
      context.lineWidth = 4;
      context.strokeRect(0, yPosition, singleWidth, singleHeight);

      // Draw inner frame
      context.strokeStyle = "#ffffff";
      context.lineWidth = 2;
      context.strokeRect(4, yPosition + 4, singleWidth - 8, singleHeight - 8);

      // Draw the photo
      context.drawImage(
        video,
        4,
        yPosition + 4,
        singleWidth - 8,
        singleHeight - 8
      );

      // Add shot number label
      context.fillStyle = "#ffffff";
      context.strokeStyle = "#000000";
      context.lineWidth = 2;
      context.font = "bold 20px Arial";
      context.textAlign = "left";

      // Text with outline effect
      context.strokeText(`Shot ${i + 1}`, 10, yPosition + 30);
      context.fillText(`Shot ${i + 1}`, 10, yPosition + 30);

      // Add timestamp
      const now = new Date();
      const timestamp = now.toLocaleTimeString();
      context.font = "12px Arial";
      context.strokeText(timestamp, 10, yPosition + singleHeight - 10);
      context.fillText(timestamp, 10, yPosition + singleHeight - 10);

      // Add separator line between images (except after last one)
      if (i < 2) {
        context.strokeStyle = "#cccccc";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(0, yPosition + singleHeight);
        context.lineTo(combinedWidth, yPosition + singleHeight);
        context.stroke();
      }
    }

    setHasPhotoShotted(true);
    setIsTakingPhotos(false);
    setCountdown(0);
  };

  const ClosePhoto = () => {
    let photo = photoReferencial.current;
    if (!photo) return;

    let contextos = photo.getContext("2d");
    if (!contextos) return;

    contextos.clearRect(0, 0, photo.width, photo.height);
    setHasPhotoShotted(false);
  };

  const [photoMode, setPhotoMode] = useState("single");

  const handleTakePhoto = () => {
    switch (photoMode) {
      case "multiple":
        TakeMultiplePhotosWidth();
        break;
      case "multiple2":
        TakeMultiplePhotos2();
        break;
      default:
        TakePhoto(); // Original single photo
    }
  };

  const SaveImage = () => {
    saveAs(
      photoReferencial.current.toDataURL("image/png"),
      "PhotoRaccaImage.png"
    );
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
            radial-gradient(circle 600px at 0% 200px, #d5c5ff, transparent),     /* Left */
            radial-gradient(circle 600px at 100% 200px, #d5c5ff, transparent),  /* Right */
            radial-gradient(circle 600px at 50% 0px, #d5c5ff, transparent),     /* Top */
            radial-gradient(circle 600px at 50% 0px, #d5c5ff, transparent),     /* Top */
            radial-gradient(circle 600px at 50% 0px, #d5c5ff, transparent),     /* Top */
            radial-gradient(circle 600px at 50% 0px, #d5c5ff, transparent),     /* Top */
            radial-gradient(circle 600px at 50% 100%, #d5c5ff, transparent)     /* Bottom */
          `,
          backgroundSize: `
            96px 64px,    
            96px 64px,    
            100% 100%,    
            100% 100%,
            100% 100%,
            100% 100%,
            100% 100%,
            100% 100%,
            100% 100%,
            100% 100%
          `,
        }}
      >
        <div>
          <div className="title">
            <PhotoraccaLogo />
          </div>
          <div className="CameraAppMain">
            <video className="VideoFrame" ref={videoRef}></video>
            <div className="Buttons">
              <select
                value={photoMode}
                onChange={(e) => {
                  setPhotoMode(e.target.value);
                }}
              >
                <option value="single">Single Photo</option>
                <option value="multiple">Multiple Photos</option>
                <option value="multiple2">Multiple Photos Stripe</option>
              </select>

              <button className="TakeShot" onClick={handleTakePhoto} disabled={isTakingPhotos}>
                { isTakingPhotos ? `Taking Photo... ${countdown > 0 ? countdown : ''}` :
                  photoMode === "single"
                  ? "Take a Photo"
                  : photoMode === "multiple"
                  ? "Take 3 Photos"
                  : "Take 3 Photos(Stripped Way)"}
              </button>
              {isTakingPhotos && countdown > 0 && (
                <div className="countdown-display">
                  Taking photo in: <span className="countdown-number">{countdown}</span>
                </div>
              )}
            </div>
          </div>
          <div
            className={"Resultas" + (hasPhotoShotted ? "hasPhotoShotted" : "")}
          >
            <canvas ref={photoReferencial}></canvas>
            <div claclassNames="Buttons2">
              <button className="CloseButton" onClick={ClosePhoto}>
                Close
              </button>
              <button className="SnapButton" onClick={SaveImage}>
                Save
              </button>
            </div>
          </div>
          <div>
            <div className="footermain">
              <div className="footer-text">
                © 2025 Ronnel Mitra, Apache License 2.0
                <a href="https://github.com/RMPlaysMCYT" target="_blank">
                  {" "}
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useRef, useEffect, useState } from "react";
import { saveAs } from "file-saver";
import "./App.css";
import PhotoraccaLogo from "./logo";

function App() {
  const videoRef = useRef(null);
  const photoReferencial = useRef(null);

  const [countdown, setCountdown] = useState(0);
  const [isTakingPhotos, setIsTakingPhotos] = useState(false);
  const [hasPhotoShotted, setHasPhotoShotted] = useState(false);
  const [photoMode, setPhotoMode] = useState("single");  
  const [stripeColors, setStripeColors] = useState(['#ffffff', '#ffffff', '#ffffff']); // Default white backgrounds
  const [borderSize, setBorderSize] = useState(50);

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
          console.log("Play interrupted, but this is expected during stream switching");
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
    const width = 1080;
    const height = width / (16 / 9);

    let video = videoRef.current;
    let photo = photoReferencial.current;

    if (!video || !photo) return;

    photo.width = width;
    photo.height = height;

    let contextos = photo.getContext("2d");
    if (!contextos) return;

    contextos.drawImage(video, 0, 0, width, height);
    setHasPhotoShotted(true);
  };

  const TakeMultiplePhotosWidth = async () => {
    setIsTakingPhotos(true);
    const video = videoRef.current;
    const photo = photoReferencial.current;

    if (!video || !photo) {
      console.error("Video or photo reference not found");
      setIsTakingPhotos(false);
      return;
    }

    const singleWidth = 1080;
    const singleHeight = singleWidth / (16 / 9);
    const combinedWidth = singleWidth * 3;
    const combinedHeight = singleHeight;

    photo.width = combinedWidth;
    photo.height = combinedHeight;

    const context = photo.getContext("2d");
    if (!context) {
      setIsTakingPhotos(false);
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, combinedWidth, combinedHeight);

    for (let i = 0; i < 3; i++) {
      
      for (let count = 3; count > 0; count--) {
        setCountdown(count);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setCountdown(0);

      const xPosition = i * singleWidth;
      context.drawImage(video, xPosition, 0, singleWidth, singleHeight);

      if (i < 2) {
        context.strokeStyle = "#c69999ff";
        context.lineWidth = 10;
        context.beginPath();
        context.moveTo(xPosition + singleWidth, 0);
        context.lineTo(xPosition + singleWidth, combinedHeight);
        context.stroke();
      }

      
      if (i < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    setHasPhotoShotted(true);
    setIsTakingPhotos(false);

    // applyFinalCanvasWithBorder();
  };




  const TakeMultiplePhotos2 = async () => {
    setIsTakingPhotos(true);
    const video = videoRef.current;
    const photo = photoReferencial.current;

    if (!video || !photo) {
      console.error("Video or photo reference not found");
      setIsTakingPhotos(false);
      return;
    }

    const singleWidth = 1080;
    const singleHeight = singleWidth / (16 / 9);
    const combinedWidth = singleWidth;
    const combinedHeight = singleHeight * 3;

    photo.width = combinedWidth;
    photo.height = combinedHeight;

    const context = photo.getContext("2d");
    if (!context) {
      setIsTakingPhotos(false);
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, combinedWidth, combinedHeight);

    for (let i = 0; i < 3; i++) {
      for (let countdown = 3; countdown > 0; countdown--) {
        setCountdown(countdown);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setCountdown(0);
      const yPosition = i * singleHeight;

      
      context.strokeStyle = "#000000";
      context.lineWidth = 4;
      context.strokeRect(0, yPosition, singleWidth, singleHeight);

      
      context.strokeStyle = "#ffffff";
      context.lineWidth = 2;
      context.strokeRect(4, yPosition + 4, singleWidth - 8, singleHeight - 8);

      
      context.drawImage(
        video,
        4,
        yPosition + 4,
        singleWidth - 8,
        singleHeight - 8
      );

      context.fillStyle = "#ffffff";
      context.strokeStyle = "#000000";
      context.lineWidth = 2;
      context.font = "bold 20px Arial";
      context.textAlign = "left";

      context.strokeText(`Shot ${i + 1}`, 10, yPosition + 30);
      context.fillText(`Shot ${i + 1}`, 10, yPosition + 30);

      const now = new Date();
      const timestamp = now.toLocaleTimeString();
      context.font = "12px Arial";
      context.strokeText(timestamp, 10, yPosition + singleHeight - 10);
      context.fillText(timestamp, 10, yPosition + singleHeight - 10);

      if (i < 2) {
        context.strokeStyle = "#cccccc";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(0, yPosition + singleHeight);
        context.lineTo(combinedWidth, yPosition + singleHeight);
        context.stroke();
      }

      if (i < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500));
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



  const handleTakePhoto = () => {
    switch (photoMode) {
      case "multiple":
        TakeMultiplePhotosWidth();
        break;
      case "multiple2":
        TakeMultiplePhotos2();
        break;
      default:
        TakePhoto();
    }
  };



  const SaveImage = () => {
    if (photoReferencial.current) {
      saveAs(
        photoReferencial.current.toDataURL("image/png"),
        "PhotoRaccaImage.png"
      );
    }
  };




  const CloseWindow = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    } else {
      window.close();
    }
  };



  // const applyFinalCanvasWithBorder = () => {
  //   const sourceCanvas = photoReferencial.current;
  //   const finalCanvas = finalCanvasRef.current;
    
  //   if (!sourceCanvas || !finalCanvas) return;

  //   const singleWidth = 1080;
  //   const singleHeight = singleWidth / (16 / 9);
  //   const combinedWidth = singleWidth * 3;
  //   const combinedHeight = singleHeight;

  //   // Set final canvas size including border
  //   finalCanvas.width = combinedWidth + (borderSize * 2);
  //   finalCanvas.height = combinedHeight + (borderSize * 2);

  //   const ctx = finalCanvas.getContext('2d');
    
  //   // Fill entire canvas with border color (or you can make this customizable too)
  //   ctx.fillStyle = '#000000'; // Black border
  //   ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

  //   // Apply individual stripe backgrounds
  //   for (let i = 0; i < 3; i++) {
  //     const xPosition = i * singleWidth;
      
  //     // Fill stripe area with selected background color
  //     ctx.fillStyle = stripeColors[i];
  //     ctx.fillRect(borderSize + xPosition, borderSize, singleWidth, singleHeight);
      
  //     // Draw the photo content for this stripe
  //     ctx.drawImage(
  //       sourceCanvas,
  //       xPosition, 0, singleWidth, singleHeight, // Source
  //       borderSize + xPosition, borderSize, singleWidth, singleHeight // Destination
  //     );
  //   }
  // };


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
            100% 100%
          `,
        }}
      >
        <div>
          <div className="title">
            <PhotoraccaLogo />
            <div>
              <button className="close-button" onClick={CloseWindow}>
                X
              </button>
            </div>
          </div>
          <div className="CameraAppMain">
            <video className="VideoFrame" ref={videoRef}></video>
            <div className="Buttons">
              <select
                value={photoMode}
                onChange={(e) => {
                  setPhotoMode(e.target.value);
                }}
                disabled={isTakingPhotos}
              >
                <option value="single">Single Photo</option>
                <option value="multiple">Multiple Photos</option>
                <option value="multiple2">Multiple Photos Stripe</option>
              </select>

              <button 
                className="TakeShot" 
                onClick={handleTakePhoto} 
                disabled={isTakingPhotos}
              >
                {isTakingPhotos 
                  ? `Taking Photo... ${countdown > 0 ? countdown : ''}` 
                  : photoMode === "single"
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
          <div className={`Resultas ${hasPhotoShotted ? "hasPhotoShotted" : ""}`}>
            <canvas ref={photoReferencial}></canvas>
            {hasPhotoShotted && (
              <div className="Buttons2">
                <button className="CloseButton" onClick={ClosePhoto}>
                  Close
                </button>
                <button className="SnapButton" onClick={SaveImage}>
                  Save
                </button>
              </div>
            )}
          </div>
          <div className="footermain">
            <div className="footermain2">
              <div className="footer-text">
                © 2025 Ronnel Mitra, Apache License 2.0
                <a href="https://github.com/RMPlaysMCYT" target="_blank" rel="noreferrer">
                  {" "}
                  GitHub
                </a>
              </div>
              <div>0.2.0-Alpha</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
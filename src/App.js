import React, { useRef, useEffect, useState } from 'react';
import {saveAs} from 'file-saver';

import './App.css';
// import logo from './logo/PhotoRaccaLogo.png';

import PhotoraccaLogo from './logo';

function App() {
  const videoRef = useRef(null);
  const photoReferencial = useRef(null);

  const [hasPhotoShotted, setHasPhotoShotted] = useState(false);

const getVideoCameraAPI = () => {

  if (!videoRef.current) return;
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1280,
      height: 720,
      facingMode: "user"
    }
  })
  .then(stream => {
    let video = videoRef.current;
    if(!video) return;
    
    if (video.srcObject) {
      const previousStream = video.srcObject;
      previousStream.getTracks().forEach(track => track.stop());
    }
    
    video.srcObject = stream;


    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    video.play().catch(err => {
      console.log("Play interrupted, but this is expected during stream switching");
    });
  })
  .catch(err => {
    console.error("Error accessing camera:", err);
    const fallbackConstraints = {
      audio: false,
      video: true
    };
    return navigator.mediaDevices.getUserMedia(fallbackConstraints);
  });
}

useEffect(() => {
  getVideoCameraAPI();
  
  return () => {
    const videoElemetos = videoRef.current;
    if (videoElemetos && videoElemetos.srcObject) {
      const stream = videoElemetos.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoElemetos.srcObject = null;
    }
  };
}, []);

const TakePhoto = () =>{

  const width = 414;
  const height = width / (16 /9);

  let video = videoRef.current;
  let photo = photoReferencial.current;

  photo.width = width;
  photo.height = height;
  
  let contextos = photo.getContext('2d');
  if (!contextos) return;

  contextos.drawImage(video, 0, 0, width, height);
  setHasPhotoShotted(true);
}


const TakeMultiplePhotos = async () => {
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
  
  const context = photo.getContext('2d');
  if (!context) return;

  // Clear the canvas first
  context.clearRect(0, 0, combinedWidth, combinedHeight);
  
  // Set a background color (optional)
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, combinedWidth, combinedHeight);

  // Take 3 photos with a small delay between them
  for (let i = 0; i < 3; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // 500ms delay
    
    // Draw each photo at its position
    const xPosition = i * singleWidth;
    context.drawImage(video, xPosition, 0, singleWidth, singleHeight);
    
    // Optional: Add border between images
    if (i < 2) {
      context.strokeStyle = '#000000';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(xPosition + singleWidth, 0);
      context.lineTo(xPosition + singleWidth, combinedHeight);
      context.stroke();
    }
  }
  
  setHasPhotoShotted(true);
}


const ClosePhoto = () => {
  let photo = photoReferencial.current;
  if (!photo) return;

  let contextos = photo.getContext('2d');
  if (!contextos) return;

  contextos.clearRect(0, 0, photo.width, photo.height);
  setHasPhotoShotted(false);
}

const [photoMode, setPhotoMode] = useState("single");

const handleTakePhoto = () => {
  switch (photoMode) {
    case 'multiple':
      TakeMultiplePhotos();
      break;
    default:
      TakePhoto(); // Original single photo
  }
};


const SaveImage = () => {
  saveAs (photoReferencial.current.toDataURL('image/png'), 'PhotoRaccaImage.png');  
}


  return (
    <div className="App">
      <div
        className="absolute inset-0 z-[-1]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #f0f0f0 1px, transparent 1px),
            linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),
            radial-gradient(circle 600px at 0% 200px, #d5c5ff, transparent),     /* Left */
            radial-gradient(circle 600px at 100% 200px, #d5c5ff, transparent),  /* Right */
            radial-gradient(circle 600px at 50% 0px, #d5c5ff, transparent),     /* Top */
            radial-gradient(circle 600px at 50% 100%, #d5c5ff, transparent)     /* Bottom */
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
          </div>
          <div className='CameraAppMain'>
            <video className='VideoFrame' ref={videoRef}></video>
            <div className="Buttons">

              <select
                value={photoMode}
                onChange={(e) => {
                  setPhotoMode(e.target.value);
                }}
              >
                <option value="single">Single Photo</option>
                <option value="multiple">Multiple Photos</option>
              

              </select>

              <button className="SnapButton" onClick={handleTakePhoto}>
                {photoMode === 'single' ? 'Take a Photo' : 'Take Photos'}
                </button>
            </div>
          </div>
          <div className={'Resultas' + (hasPhotoShotted ? 'hasPhotoShotted' : '')}>
            <canvas ref={photoReferencial}></canvas>
            <button className='SnapButton' onClick={ClosePhoto}>Close</button>
            <button className='SnapButton' onClick={SaveImage}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
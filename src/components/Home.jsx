import React from "react";
import { useWebCamera } from "../code_Modules/webCameraAPI";

const Home = () => {
  const { videoRef, photoReferencial } = useWebCamera();

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

        <div className="cameraButtons">
          <select className="modeSelectorBtn">
            <option value="single">Single Photo</option>
            <option value="multiple">Multiple Photos</option>
            <option value="multiple2">Multiple Photos Stripe</option>
          </select>
          <button className="takePhotoBtn">Take a Photo</button>
        </div>
      </div>
    </main>
  );
};

export default Home;

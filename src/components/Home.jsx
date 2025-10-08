import React, {  useState, useRef, useEffect, Component} from 'react';

import { useWebCamera } from "../code_Modules/webCameraAPI"; // Changed import

// import PhotoraccaLogo from "../assets/pictures/Photoraccalogo.png";
// import CloseButton from "../assets/images/closeImage.png";

class Home extends Component {
    render (){
        const {
          videoRef,
          photoReferencial,
          mediaStreamed,
        } = useWebCamera(); // Now using as hook
        return (
          <main className="Homepage">
            <div className="MainWindow">
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
            </div>
          </main>
        )
    }
}

export default Home
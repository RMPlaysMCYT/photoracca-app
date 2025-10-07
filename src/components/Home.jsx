import React, {Component} from 'react';

class HomePage extends Component {
    render (){
        return (
          <main className="Homepage">
            <div className="Header">
              <img className="logo" src={PhotoraccaLogo}/>
              <img className="close-btn" src={CloseButton} onClick={closeWindow}/>
            </div>
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
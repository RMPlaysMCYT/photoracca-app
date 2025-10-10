import React, { forwardRef, useImperativeHandle } from "react";
import { Helmet } from "react-helmet";

const SinglePhoto = forwardRef(({ videoRef, canvasRef }, ref) => {
  useImperativeHandle(ref, () => ({
    takePhoto: () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      console.log("Taking photo...", { video, canvas });

      if (!video || !canvas) {
        console.warn("Video or Canvas not available");
        return null;
      }

      // Wait for video to be ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn("Video not ready yet");
        return null;
      }

      const ctx = canvas.getContext("2d");
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = canvas.toDataURL("image/png");

      console.log("Captured Image:", imageData);

      // Optional: show preview
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Captured Photo</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  min-height: 100vh;
                  background: #f0f0f0;
                }
                img { 
                  max-width: 100%; 
                  height: auto; 
                  border: 2px solid #333;
                  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                }
              </style>
            </head>
            <body>
              <img src="${imageData}" alt="Captured Photo" />
            </body>
          </html>
        `);
        newWindow.document.close();
      }

      return imageData;
    },
  }));

  return (
    <div className="singlePhotoMode">
      <Helmet>
        <title>Single Photo Capture</title>
      </Helmet>
      <p>Ready to capture a single photo.</p>
    </div>
  );
});

export default SinglePhoto;
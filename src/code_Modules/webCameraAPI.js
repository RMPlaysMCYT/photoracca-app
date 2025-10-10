import { useRef, useState, useEffect } from "react";

export function useWebCamera() {
  const videoRef = useRef(null);
  const photoReferencial = useRef(null);
  const [mediaStreamed, setMediaStreamed] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    let stream;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to load and be ready
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true);
            console.log("Camera ready, video dimensions:", 
              videoRef.current.videoWidth, "x", videoRef.current.videoHeight);
          };
        }
        
        setMediaStreamed(stream);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setCameraReady(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setCameraReady(false);
        console.log("Camera stopped");
      }
    };
  }, []);

  return { 
    videoRef, 
    photoReferencial, 
    mediaStreamed,
    cameraReady 
  };
}
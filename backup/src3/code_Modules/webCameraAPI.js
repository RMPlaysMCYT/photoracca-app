// webCameraAPI.js
import { useState, useRef, useEffect } from "react";

export const useWebCamera = () => {
  const photoReferencial = useRef(null);
  const videoRef = useRef(null);
  
  const [mediaStreamed, setMediaStreamed] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const startWebCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user"
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setMediaStreamed(true);
    } catch (err) {
      console.error("Camera error:", err);
      setError(err.message || "Failed to access camera");
      setMediaStreamed(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-start camera when hook is used
  useEffect(() => {
    startWebCamera();
  }, []);

  return {
    videoRef,
    photoReferencial,
    mediaStreamed,
    error,
    isLoading,
    startWebCamera
  };
};
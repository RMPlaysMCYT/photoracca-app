// webCameraAPI.js
import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";

export const useWebCamera = () => {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("user");
  const [mirrored, setMirrored] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const switchCamera = useCallback(() => {
    setFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
    // Turn off mirroring when switching to back camera
    if (facingMode === "user") {
      setMirrored(false);
    }
  }, [facingMode]);

  const toggleCamera = useCallback(() => {
    setIsCameraOn(prev => !prev);
  }, []);

  const toggleMirror = useCallback(() => {
    setMirrored(prev => !prev);
  }, []);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current && isCameraOn) {
      const imageSrc = webcamRef.current.getScreenshot();
      return imageSrc;
    }
    return null;
  }, [isCameraOn]);

  const videoConstraints = {
    facingMode: facingMode,
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  };

  return {
    webcamRef,
    facingMode,
    mirrored,
    isCameraOn,
    isLoading,
    error,
    switchCamera,
    toggleCamera,
    toggleMirror,
    capturePhoto,
    videoConstraints
  };
};
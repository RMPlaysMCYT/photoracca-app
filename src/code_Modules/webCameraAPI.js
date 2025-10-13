import { useRef, useState, useEffect } from "react";

export function useWebCamera() {
  const videoRef = useRef(null);
  const photoReferencial = useRef(null);
  const [mediaStreamed, setMediaStreamed] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    const streamRef = { current: null };

    async function startCamera() {
      try {
        const constraints = { video: { width: { ideal: 2560 }, height: { ideal: 1440 } } };
        if (deviceId) {
          // prefer exact device if provided
          constraints.video.deviceId = { exact: deviceId };
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        setCameraReady(false);
        console.log("Camera stopped");
      }
    };
  }, []);

  // restart camera when deviceId changes
  useEffect(() => {
    // trigger start/stop by re-running the effect in outer scope
    // We keep an explicit call: stop previous tracks and restart
    let mounted = true;
    (async () => {
      if (!mounted) return;
      try {
        if (mediaStreamed) {
          mediaStreamed.getTracks().forEach((t) => t.stop());
        }
      } catch (e) {
        // ignore
      }
      try {
        const constraints = { video: { width: { ideal: 2560 }, height: { ideal: 1440 } } };
        if (deviceId) constraints.video.deviceId = { exact: deviceId };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (mounted) {
          setMediaStreamed(stream);
          if (videoRef.current) videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Failed to restart camera with deviceId', deviceId, err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [deviceId]);

  return { 
    videoRef, 
    photoReferencial, 
    mediaStreamed,
    cameraReady,
    deviceId,
    setDeviceId
  };
}
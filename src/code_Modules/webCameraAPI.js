// code_Modules/webCameraAPI.js
import { useRef, useState, useEffect } from "react";

export function useWebCamera() {
  const videoRef = useRef(null);
  const photoReferencial = useRef(null);
  const [mediaStreamed, setMediaStreamed] = useState(null);

  useEffect(() => {
    let stream;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setMediaStreamed(stream);
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }

    startCamera();

    // 🧹 Cleanup: stop camera when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        console.log("Camera stopped");
      }
    };
  }, []);

  return { videoRef, photoReferencial, mediaStreamed };
}

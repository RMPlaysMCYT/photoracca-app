// code_Modules/takePhoto4Shots.js
import { useCallback, useRef } from 'react';

export const usePhotoBooth = (capturePhoto) => {
  const shotCount = useRef(0);
  const capturedPhotos = useRef([]);
  const timerRef = useRef(null);

  const startFourShots = useCallback((onProgress, onComplete) => {
    if (!capturePhoto) {
      console.error('Capture photo function not available');
      return;
    }

    // Reset state
    shotCount.current = 0;
    capturedPhotos.current = [];
    
    const takeShot = () => {
      if (shotCount.current < 4) {
        // Update progress
        onProgress?.(shotCount.current + 1, 4);
        
        // Take photo
        const photo = capturePhoto();
        if (photo) {
          capturedPhotos.current.push(photo);
        }
        
        shotCount.current++;
        
        // Continue to next shot or complete
        if (shotCount.current < 4) {
          timerRef.current = setTimeout(takeShot, 3000); // 3 seconds between shots
        } else {
          timerRef.current = setTimeout(() => {
            onComplete?.(capturedPhotos.current);
          }, 1000); // Small delay after last shot
        }
      }
    };

    // Start first shot after 1 second delay
    timerRef.current = setTimeout(takeShot, 1000);
  }, [capturePhoto]);

  const cancelShots = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    shotCount.current = 0;
    capturedPhotos.current = [];
  }, []);

  const isTakingPhotos = useCallback(() => {
    return shotCount.current > 0 && shotCount.current < 4;
  }, []);

  return {
    startFourShots,
    cancelShots,
    isTakingPhotos: isTakingPhotos(),
    getCurrentShot: () => shotCount.current,
    getTotalShots: () => 4
  };
};
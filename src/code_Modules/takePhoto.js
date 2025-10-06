import React, { useRef, useEffect, useState } from "react";

export const capturePhoto = useCallback(() => {
  if (webcamRef.current) {
    const imageSrc = webcamRef.current.getScreenshot();
    return imageSrc;
  }
  return null;
}, []);

return capturePhoto;
export const toggleCamera = useCallback(() => {
  setIsCameraOn((prev) => !prev);
}, []);

return toggleCamera;

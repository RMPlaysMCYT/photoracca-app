export const toggleMirrorCamera = useCallback(() => {
  setMirrored((prev) => !prev);
}, []);

return toggleMirrorCamera;

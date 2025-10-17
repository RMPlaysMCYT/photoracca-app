export const closeWindow = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    } else {
      // Fallback for browser
      window.close();
    }
}
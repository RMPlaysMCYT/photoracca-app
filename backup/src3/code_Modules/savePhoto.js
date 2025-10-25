// import { saveAs } from "file-saver";?

export const savePicture = () => {
    // Save photo functionality
    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `photoracca-${Date.now()}.jpg`;
    link.click();
};
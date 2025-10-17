import { Component } from "react";

async function processImageSingularPhoto(canvas, videoStreamed, photoReferencial) {
    if (!canvas) {
        throw new Error("Canvas is null");
    }

    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) {
        throw new Error("Canvas context is null");
    }

    clearCanvas(canvasContext);

    if (videoStreamed) {
        try {
            await createImageFromVideo(videoStreamed, canvasContext);
        } catch (error) {
            console.error(`Error creating image from video: ${error}`);
        }
    }

    if (photoReferencial) {
        try {
            await createImageFromCanvas(photoReferencial, canvasContext);
        } catch (error) {
            console.error(`Error creating image from photo: ${error}`);
        }
    }

    try {
        await addImageBorderline(canvasContext);
        const url = canvas.toDataURL("image/png");
        return url;
    } catch (error) {
        console.error(`Error adding image border: ${error}`);
    }
}

export default processImageSingularPhoto;

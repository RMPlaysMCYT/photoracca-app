import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import PhotoRacca_frame0 from "./PhotoRacca_frame0.png";

import './css/buttons-single.css';

const SinglePhoto = forwardRef(({ videoRef, canvasRef }, ref) => {
  const [capturedData, setCapturedData] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [frame, setFrame] = useState("none");
  const [framedData, setFramedData] = useState(null);

  // Helper to download data URL
  const downloadDataUrl = (dataUrl, filename = "captured_photo.png") => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Compose the captured image with the selected frame into a new dataURL
  const generateFramedDataUrl = (dataUrl, selectedFrame) => {
    return new Promise((resolve, reject) => {
      if (!dataUrl) return reject(new Error("No image data"));
      if (selectedFrame === "none") return resolve(dataUrl);

      const img = new Image();
      // important for data URLs - no crossOrigin needed for same-origin dataURL
      img.onload = () => {
        const iw = img.width;
        const ih = img.height;

        if (selectedFrame === "rounded") {
          const canvas = document.createElement("canvas");
          canvas.width = iw;
          canvas.height = ih;
          const ctx = canvas.getContext("2d");

          const r = Math.min(iw, ih) * 0.06; // corner radius
          // draw rounded clipping
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          roundRect(ctx, 0, 0, canvas.width, canvas.height, r);
          ctx.clip();
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/png"));
          return;
        }

        if (selectedFrame === "polaroid") {
          const pad = Math.round(Math.min(iw, ih) * 0.06);
          const bottomExtra = Math.round(ih * 0.16);
          const canvasW = iw + pad * 2;
          const canvasH = ih + pad * 2 + bottomExtra;
          const canvas = document.createElement("canvas");
          canvas.width = canvasW;
          canvas.height = canvasH;
          const ctx = canvas.getContext("2d");

          // white background
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvasW, canvasH);

          // image
          ctx.drawImage(img, pad, pad, iw, ih);

          // subtle border
          ctx.strokeStyle = "#dddddd";
          ctx.lineWidth = 2;
          ctx.strokeRect(pad - 1, pad - 1, iw + 2, ih + 2);

          resolve(canvas.toDataURL("image/png"));
          return;
        }

        if (selectedFrame === "vintage") {
          const pad = Math.round(Math.min(iw, ih) * 0.04);
          const canvasW = iw + pad * 2;
          const canvasH = ih + pad * 2;
          const canvas = document.createElement("canvas");
          canvas.width = canvasW;
          canvas.height = canvasH;
          const ctx = canvas.getContext("2d");

          // vintage gradient background
          const g = ctx.createLinearGradient(0, 0, canvasW, canvasH);
          g.addColorStop(0, "#f6ecd2");
          g.addColorStop(1, "#e8d3b3");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, canvasW, canvasH);

          // inner frame background (slightly darker)
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.fillRect(pad, pad, iw, ih);

          // draw image
          ctx.drawImage(img, pad, pad, iw, ih);

          // vintage border
          ctx.strokeStyle = "rgba(80,40,20,0.12)";
          ctx.lineWidth = Math.max(4, Math.round(Math.min(iw, ih) * 0.02));
          ctx.strokeRect(pad - 1, pad - 1, iw + 2, ih + 2);

          resolve(canvas.toDataURL("image/png"));
          return;
        }

        // overlay/frame PNG support (e.g. PhotoRacca_Frame0)
        if (selectedFrame === "frame0") {
          const overlay = new Image();
          overlay.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = iw;
            canvas.height = ih;
            const ctx = canvas.getContext("2d");
            // draw base image full-size
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // draw overlay scaled to same size
            ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/png"));
          };
          overlay.onerror = () => {
            // if overlay fails, fallback to original
            resolve(dataUrl);
          };
          overlay.src = PhotoRacca_frame0;
          return;
        }

        // fallback: return original
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load captured image"));
      img.src = dataUrl;
    });
  };

  // draw rounded rectangle helper
  const roundRect = (ctx, x, y, w, h, r) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Small inline styles for preview and frames
  const previewStyles = {
    container: {
      background: "rgba(0, 0, 0, 0.5)",
      top: "-60vh",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      alignSelf: "center",
      gap: "12px",
      marginTop: "12px",
      padding: "200px",
      bottom: "10vh",
    },
    imgWrapper: {
      position: "relative",
      display: "inline-block",
      maxWidth: "90%",
      boxSizing: "border-box",
    },
    img: {
      position: "relative",
      display: "block",
      width: "100%",
      maxWidth: "960px", // scale preview down in UI but keep aspect
      height: "auto",
      objectFit: "contain",
      boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    },
    // frames implemented via additional wrapper styles
    frames: {
      polaroid: {
        padding: "18px 18px 46px 18px",
        background: "#fff",
        border: "1px solid #ddd",
      },
      rounded: {
        padding: 0,
        borderRadius: "14px",
        overflow: "hidden",
      },
      vintage: {
        padding: "8px",
        background: "linear-gradient(135deg,#f6ecd2,#e8d3b3)",
        border: "6px solid rgba(80,40,20,0.12)",
      },
      frame0: {
        padding: 0,
      },
      none: {},
    },
  };
  useImperativeHandle(ref, () => ({
    takePhoto: () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      console.log("Taking photo...", { video, canvas });

      if (!video || !canvas) {
        console.warn("Video or Canvas not available");
        return null;
      }

      // Wait for video to be ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn("Video not ready yet");
        return null;
      }

      const ctx = canvas.getContext("2d");

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data
      const imageData = canvas.toDataURL("image/png");

      console.log("Captured Image:", imageData);

      // Keep full-resolution capture for saving
      setCapturedData(imageData);

      // Generate a 1920x1080 preview (letterboxed/pillarboxed to preserve aspect)
      try {
        const PREVIEW_W = 1920;
        const PREVIEW_H = 1080;
        const pCanvas = document.createElement("canvas");
        pCanvas.width = PREVIEW_W;
        pCanvas.height = PREVIEW_H;
        const pCtx = pCanvas.getContext("2d");
        // letterbox background
        pCtx.fillStyle = "#000";
        pCtx.fillRect(0, 0, PREVIEW_W, PREVIEW_H);

        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const scale = Math.min(PREVIEW_W / vw, PREVIEW_H / vh);
        const drawW = Math.round(vw * scale);
        const drawH = Math.round(vh * scale);
        const dx = Math.round((PREVIEW_W - drawW) / 2);
        const dy = Math.round((PREVIEW_H - drawH) / 2);
        pCtx.drawImage(video, 0, 0, vw, vh, dx, dy, drawW, drawH);
        const preview = pCanvas.toDataURL("image/png");
        setPreviewData(preview);
      } catch (err) {
        console.warn("Preview generation failed", err);
        setPreviewData(imageData);
      }

      setShowPreview(true);

      return imageData;
    },
    // returns a Promise resolving to a dataURL that includes the currently selected frame
    getFramedData: async () => {
      // Prefer cached framedData if available
      if (!capturedData) return null;
      if (framedData) return framedData;
      try {
        const framed = await generateFramedDataUrl(capturedData, frame);
        return framed;
      } catch (e) {
        console.warn("Failed to generate framed data:", e);
        return capturedData;
      }
    },
  }));

  // keep a cached framed data URL so callers (gallery) can grab it synchronously via getFramedData
  useEffect(() => {
    let mounted = true;
    if (!capturedData) {
      setFramedData(null);
      return;
    }
    // async compose
    (async () => {
      try {
        const fd = await generateFramedDataUrl(capturedData, frame);
        if (mounted) setFramedData(fd);
      } catch (e) {
        if (mounted) setFramedData(capturedData);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [capturedData, frame]);

  return (
    <div className="singlePhotoMode">
      <Helmet>
        <title>Single Photo Capture</title>
        <meta name="description" content="Capture a single photo with optional frames using Photoracca Desktop." />
        <meta property="og:title" content="Single Photo Capture" />
        <meta property="og:description" content="Capture a single photo with optional frames using Photoracca Desktop." />
        <meta property="og:image" content={PhotoRacca_frame0} />
      </Helmet>
      <p style={{ textAlign: "center" }}>Ready to capture a single photo.</p>

      {/* Inline preview shown after takePhoto() is called */}
      {showPreview && capturedData && (
        <div style={previewStyles.container} className="capturePreview">
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <label style={{ fontSize: 14 }}>Frame:</label>
            <select className="select-design" value={frame} onChange={(e) => setFrame(e.target.value)}>
              <option value="none">None</option>
              <option value="polaroid">Polaroid</option>
              <option value="rounded">Rounded</option>
              <option value="vintage">Vintage</option>
              <option value="frame0">Frame (PNG overlay)</option>
            </select>
          </div>

          <div
            style={{
              ...previewStyles.imgWrapper,
              ...(previewStyles.frames[frame] || {}),
            }}
          >
            <img
              alt="Captured"
              src={previewData || capturedData}
              style={{ ...previewStyles.img, ...(frame === "rounded" ? { borderRadius: "14px" } : {}) }}
            />
            {frame === "frame0" && (
              <img
                alt="Frame Overlay"
                src={PhotoRacca_frame0}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button className="buttons-single"
              onClick={async () => {
                try {
                  const date1 = new Date().toISOString();
                  const framed = await generateFramedDataUrl(capturedData, frame);
                  downloadDataUrl(framed, `photoracca_${frame}_${date1}.png`);
                } catch (e) {
                  // fallback to raw
                  console.warn('Failed to generate framed image, saving raw image', e);
                  downloadDataUrl(capturedData);
                }
              }}
            >
              Save Image
            </button>
            <button
              className="buttons-single"
              onClick={() => {
                setShowPreview(false);
                // keep capturedData if user wants to re-open preview; clear if you prefer
                // setCapturedData(null);
              }}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default SinglePhoto;
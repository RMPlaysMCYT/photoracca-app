import { forwardRef, useImperativeHandle, useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import PhotoRacca_frame0 from "./PhotoRacca_frame0.png";

import shutterSound from "../audio/shutter.mp3";

import './css/buttons-single.css';
import './css/singlePhoto.css';



const SinglePhoto = forwardRef(({ videoRef, canvasRef, mirrorPreview = false }, ref) => {
  const [running, setRunning] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [capturedData, setCapturedData] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [frame, setFrame] = useState("none");
  const [framedData, setFramedData] = useState(null);

  const shutterSounda = useRef(new Audio(shutterSound));

  const downloadDataUrl = (dataUrl, filename = "captured_photo.png") => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const generateFramedDataUrl = (dataUrl, selectedFrame) => {
    return new Promise((resolve, reject) => {
      if (!dataUrl) return reject(new Error("No image data"));
      if (selectedFrame === "none") return resolve(dataUrl);

      const img = new Image();
      img.onload = () => {
        const iw = img.width;
        const ih = img.height;

        if (selectedFrame === "rounded") {
          const canvas = document.createElement("canvas");
          canvas.width = iw;
          canvas.height = ih;
          const ctx = canvas.getContext("2d");

          const r = Math.min(iw, ih) * 0.06;

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

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvasW, canvasH);

          ctx.drawImage(img, pad, pad, iw, ih);

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

          const g = ctx.createLinearGradient(0, 0, canvasW, canvasH);
          g.addColorStop(0, "#f6ecd2");
          g.addColorStop(1, "#e8d3b3");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, canvasW, canvasH);

          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.fillRect(pad, pad, iw, ih);

          ctx.drawImage(img, pad, pad, iw, ih);

          ctx.strokeStyle = "rgba(80,40,20,0.12)";
          ctx.lineWidth = Math.max(4, Math.round(Math.min(iw, ih) * 0.02));
          ctx.strokeRect(pad - 1, pad - 1, iw + 2, ih + 2);

          resolve(canvas.toDataURL("image/png"));
          return;
        }

        if (selectedFrame === "frame0") {
          const overlay = new Image();
          overlay.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = iw;
            canvas.height = ih;
            const ctx = canvas.getContext("2d");
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/png"));
          };
          overlay.onerror = () => {
            resolve(dataUrl);
          };
          overlay.src = PhotoRacca_frame0;
          return;
        }

        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load captured image"));
      img.src = dataUrl;
    });
  };

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
      maxWidth: "960px", 
      height: "auto",
      objectFit: "contain",
      boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    },

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
      if (running) return;
      setRunning(true);
      let count =3; 
      setCurrentCount(count);

      const timer = setInterval(() => {
        count--;
        setCurrentCount(count);
        if (count <= 0) {
          clearInterval(timer);

          shutterSounda.current.currentTime = 0;
          shutterSounda.current.play();

          const video = videoRef.current;
          const canvas = canvasRef.current;

          if (!video || !canvas || video.videoWidth === 0) {
            console.warn("Video not ready yet");
            setRunning(false);
            return;
          }

          const ctx = canvas.getContext("2d");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = canvas.toDataURL("image/png");
          setCapturedData(imageData);

          try {
            const PREVIEW_W = 1920;
            const PREVIEW_H = 1080;
            const pCanvas = document.createElement("canvas");
            pCanvas.width = PREVIEW_W;
            pCanvas.height = PREVIEW_H;
            const pCtx = pCanvas.getContext("2d");
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
            setPreviewData(pCanvas.toDataURL("image/png"));
          } catch (err) {
            setPreviewData(imageData);
          }

          setShowPreview(true);
          setRunning(false);
        }
      }, 1000);
    },
    
    getFramedData: async () => {
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

  useEffect(() => {
    let mounted = true;
    if (!capturedData) {
      setFramedData(null);
      return;
    }
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
        <title>Photoracca App</title>
        <meta name="description" content="Capture a single photo with optional frames using Photoracca Desktop." />
        <meta property="og:title" content="Single Photo Capture" />
        <meta property="og:description" content="Capture a single photo with optional frames using Photoracca Desktop." />
        <meta property="og:image" content={PhotoRacca_frame0} />
      </Helmet>
      <p style={{ textAlign: "center" }}>Ready to capture a single photo.</p>
      {running && currentCount > 0 && (
        <div className="counterMobi">
          {currentCount}
        </div>
      )}
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
              style={{
                ...previewStyles.img,
                ...(frame === "rounded" ? { borderRadius: "14px" } : {}),
                transform: mirrorPreview ? "scaleX(-1)" : "none",
                transformOrigin: "center",
              }}
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
                  transform: mirrorPreview ? "scaleX(-1)" : "none",
                  transformOrigin: "center",
                }}
              />
            )}
          </div>

          <div style={{ display: "flex", gap: "20px", borderTop: "1px solid #ccc" }}>
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
                setCurrentCount(0);
                setShowPreview(false);
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
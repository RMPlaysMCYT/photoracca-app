import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import PhotoRacca_Frame0 from "../frames/PhotoRacca_frame0.png";

import "./css/buttons-multiple-photo.css";

/**
 * MultiplePhotoStripe
 * - countdown (default 3s) before each shot
 * - captures up to maxPhotos (default 4)
 * - supports basic frames (none, polaroid, rounded, vintage) and PNG overlay (frame0)
 * - exposes ref methods: startStrip(), stopStrip(), getPhotos(), saveStrip()
 */
const MultiplePhotoStripe = forwardRef(
  ({ videoRef, canvasRef, countdown = 3, maxPhotos = 4, mirrorPreview = false }, ref) => {
    const [running, setRunning] = useState(false);
    const [currentCount, setCurrentCount] = useState(0);
    const [photos, setPhotos] = useState([]); // array of dataURL (raw captures)
    const [framedPhotos, setFramedPhotos] = useState([]); // cached framed dataURLs
    const [frame, setFrame] = useState("none");
    const countdownRef = useRef(null);
    const abortRef = useRef(false);

    // helper to download
    const downloadDataUrl = (dataUrl, filename = "strip.png") => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    };

    // rounded rect helper
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

    // Compose single framed data URL (supports overlay frame0)
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
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvasW, canvasH);
            ctx.drawImage(img, pad, pad, iw, ih);
            ctx.strokeStyle = "#ddd";
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
            overlay.onerror = () => resolve(dataUrl);
            overlay.src = PhotoRacca_Frame0;
            return;
          }

          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = dataUrl;
      });
    };

    // compose vertical strip from framed photos
    const composeStrip = async (
      framedArray,
      spacing = 12,
      background = "#fff"
    ) => {
      if (!framedArray || framedArray.length === 0) return null;
      // load all images
      const imgs = await Promise.all(
        framedArray.map((d) => {
          return new Promise((res, rej) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = rej;
            i.src = d;
          });
        })
      );

      const width = Math.max(...imgs.map((i) => i.width));
      const totalHeight =
        imgs.reduce((s, i) => s + i.height, 0) + spacing * (imgs.length - 1);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = totalHeight;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let y = 0;
      for (const im of imgs) {
        // center each image horizontally
        const x = Math.round((width - im.width) / 2);
        ctx.drawImage(im, x, y, im.width, im.height);
        y += im.height + spacing;
      }
      return canvas.toDataURL("image/png");
    };

    // capture a single frame from video element
    const captureOnce = () => {
      const video = videoRef?.current;
      const canvas = canvasRef?.current;
      if (!video || !canvas) return null;
      if (video.videoWidth === 0 || video.videoHeight === 0) return null;
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/png");
    };

    // main strip runner
    const runStrip = async () => {
      if (running) return;
      abortRef.current = false;
      setRunning(true);
      setPhotos([]);
      setFramedPhotos([]);

      for (let i = 0; i < maxPhotos; i++) {
        if (abortRef.current) break;
        // countdown
        for (let t = countdown; t > 0; t--) {
          setCurrentCount(t);
          // wait 1 second
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 1000));
          if (abortRef.current) break;
        }
        if (abortRef.current) break;
        setCurrentCount(0);
        // capture
        const raw = captureOnce();
        if (!raw) {
          // camera not ready; stop
          console.warn("Failed to capture - video/canvas not ready");
          break;
        }
        // add raw
        setPhotos((p) => [...p, raw]);
        // generate framed version async and cache
        generateFramedDataUrl(raw, frame)
          .then((fd) => setFramedPhotos((fp) => [...fp, fd]))
          .catch(() => setFramedPhotos((fp) => [...fp, raw]));

        // small pause between captures
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 500));
      }

      setCurrentCount(0);
      setRunning(false);
    };

    useImperativeHandle(ref, () => ({
      startStrip: () => runStrip(),
      stopStrip: () => {
        abortRef.current = true;
        setRunning(false);
        setCurrentCount(0);
      },
      getPhotos: async (includeFramed = true) => {
        if (includeFramed) {
          // wait for any pending framed generation (best effort)
          // if framedPhotos length < photos length, generate missing ones
          const needed = photos.length - framedPhotos.length;
          if (needed > 0) {
            const start = framedPhotos.length;
            for (let i = start; i < photos.length; i++) {
              try {
                const fd = await generateFramedDataUrl(photos[i], frame);
                setFramedPhotos((fp) => {
                  const copy = [...fp];
                  copy[i] = fd;
                  return copy;
                });
              } catch (e) {
                setFramedPhotos((fp) => {
                  const copy = [...fp];
                  copy[i] = photos[i];
                  return copy;
                });
              }
            }
          }
          return framedPhotos.length === photos.length ? framedPhotos : photos;
        }
        return photos;
      },
      saveStrip: async () => {
        const toSave =
          framedPhotos.length === photos.length ? framedPhotos : photos;
        const strip = await composeStrip(toSave);
        if (strip) downloadDataUrl(strip, "photoracca_strip.png");
        return strip;
      },
    }));

    // small cleanup if component unmounts
    useEffect(() => {
      return () => {
        abortRef.current = true;
      };
    }, []);

    return (
      <div
        className="multiplePhotoStripe"
        style={{ padding: 12, display: "flex", justifyContent: "center", flexDirection: "column", alignContent: "center" }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
          <label>Frame:</label>
          <select 
          className="select-design"
          value={frame} 
            onChange={
              (e) => setFrame(e.target.value)
            }>
            <option value="none">None</option>
            <option value="polaroid">Polaroid</option>
            <option value="rounded">Rounded</option>
            <option value="vintage">Vintage</option>
            <option value="frame0">Frame (PNG overlay)</option>
          </select>

          {/* <button
            className="buttons-single"
            onClick={() => runStrip()}
            disabled={running}
          >
            Start Strip ({maxPhotos} photos)
          </button> */}
          <button
            className="buttons-single"
            onClick={() => {
              abortRef.current = true;
              setRunning(false);
              setCurrentCount(0);
            }}
            disabled={!running}
          >
            Stop
          </button>
          <button
            className="buttons-single"
            onClick={async () => {
              const s = await (ref && ref.current && ref.current.saveStrip
                ? ref.current.saveStrip()
                : null);
              if (!s) {
                // fallback: compose locally
                const strip = await composeStrip(
                  framedPhotos.length === photos.length ? framedPhotos : photos
                );
                if (strip) downloadDataUrl(strip, "photoracca_strip.png");
              }
            }}
          >
            Save Strip
          </button>
        </div>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
          {running && currentCount > 0 && (
            <div style={{ position: "absolute", top: 300, fontSize: 48, fontWeight: "bold", color: "#e53935", margin: 12 }}>
              {currentCount}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {(framedPhotos.length > 0 ? framedPhotos : photos).map((p, idx) => (
              <div key={idx} style={{ width: 120, position: "relative" }}>
                <img
                  src={p}
                  alt={`shot-${idx}`}
                  style={{ width: "100%", display: "block" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

export default MultiplePhotoStripe;

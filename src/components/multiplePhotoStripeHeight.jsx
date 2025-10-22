import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import { Helmet } from "react-helmet";
import PhotoRacca_Frame0 from "../frames/PhotoRacca_frame0.png";

import photoracca_strip_Frame0 from "../frames/photoracca_strip_Frame0.png";
import photoracca_strip_Frame1 from "../frames/photoracca_strip_Frame1.png";
import photoracca_strip_Frame2 from "../frames/photoracca_strip_Frame2.png";
import photoracca_strip_Frame3 from "../frames/photoracca_strip_Frame3.png";
import photoracca_strip_Frame4 from "../frames/photoracca_strip_Frame4.png";
import photoracca_strip_Frame5 from "../frames/photoracca_strip_Frame5.png";

import photoracca_strip_Frame_Polaroid0 from "../frames/photoracca_strip_Frame_Polaroid0.png";
import photoracca_strip_Frame_Polaroid1 from "../frames/photoracca_strip_Frame_Polaroid1.png";


import shutterSound from "../audio/shutter.mp3";

const MultiplePhotoStripeHeight = forwardRef(
  ({
    videoRef,
    canvasRef,
    countdown = 3,
    maxPhotos = 4,
    exportWidth = 2560,
    exportHeight = 5796,
    mirrorPreview = false,
  }, ref) => {
    const [running, setRunning] = useState(false);
    const [currentCount, setCurrentCount] = useState(0);
    const [photos, setPhotos] = useState([]);
    const [framedPhotos, setFramedPhotos] = useState([]);
    const [frame, setFrame] = useState("none");
    const [stripOverlay, setStripOverlay] = useState("none");
    // const [stripDecoOverlay, setstripDecoOverlay] = useState("none");
    const [preset, setPreset] = useState("none");

    const shutterSounda = useRef(new Audio(shutterSound));

    useEffect(() => {
      if (frame === "none" && stripOverlay === "none") setPreset("none");
      else if (frame === "polaroid" && stripOverlay === "none")
        setPreset("polaroid");
      else if (frame === "rounded" && stripOverlay === "none")
        setPreset("rounded");
      else if (frame === "vintage" && stripOverlay === "none")
        setPreset("vintage");
      else if (frame === "none" && stripOverlay === "strip0")
        setPreset("strip0");
      else if (frame === "none" && stripOverlay === "strip1")
        setPreset("strip1");
      else if (frame === "polaroid" && stripOverlay === "strip0")
        setPreset("polaroid_strip0");
      else if (frame === "rounded" && stripOverlay === "strip1")
        setPreset("rounded_strip1");
      else setPreset("custom");
    }, [frame, stripOverlay]);
    const [previewStrip, setPreviewStrip] = useState(null);
    const countdownRef = useRef(null);
    const abortRef = useRef(false);


    const downloadDataUrl = (dataUrl, filename = "strip.png") => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
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




    const composeStrip = async (
      framedArray,
      spacing = 10,
      background = "#fff",
      targetWidth = 800,
      outerPadding = 24,
      overlaySrc = null,
      overlayMode = "overlay",
      targetHeight = null

    ) => {
      if (!framedArray || framedArray.length === 0) return null;
      // load all images
      const imgs = await Promise.all(
        framedArray.map(
          (d) =>
            new Promise((res, rej) => {
              const i = new Image();
              i.onload = () => res(i);
              i.onerror = rej;
              i.src = d;
            })
        )
      );

      const contentWidth = Math.max(1, targetWidth - outerPadding * 2);

      const baseScaledHeights = imgs.map((im) => (im.height * contentWidth) / im.width);


      let scaledHeights = baseScaledHeights.map((h) => Math.round(h));
      let canvasHeight =
        scaledHeights.reduce((s, h) => s + h, 0) +
        spacing * (imgs.length - 1) +
        outerPadding * 1.2;

      let finalContentWidth = contentWidth;
      let finalX = outerPadding;

      if (targetHeight && Number.isFinite(targetHeight) && targetHeight > 0) {
        const availablePhotosArea = Math.max(
          1,
          targetHeight - outerPadding * 2 - spacing * (imgs.length - 1)
        );
        const sumBaseHeights = baseScaledHeights.reduce((s, h) => s + h, 0) || 1;
        const globalScale = availablePhotosArea / sumBaseHeights;
        scaledHeights = baseScaledHeights.map((h) => Math.max(1, Math.round(h * globalScale)));
        canvasHeight = targetHeight;

        finalContentWidth = Math.max(1, Math.round(contentWidth * globalScale));
        finalX = (targetWidth - finalContentWidth) / 2;
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let y = outerPadding;
      for (let idx = 0; idx < imgs.length; idx++) {
        const im = imgs[idx];
        const h = scaledHeights[idx];

        const x = finalX;
        ctx.drawImage(im, x, y, finalContentWidth, h);

        y += h + spacing;
      }

      if (overlaySrc) {
        await new Promise((res) => {
          const o = new Image();
          o.onload = () => {
            try {
              if (overlayMode === "background") {

                ctx.globalCompositeOperation = "source-over";
                ctx.drawImage(o, 0, 0, canvas.width, canvas.height);

                ctx.fillStyle = background;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                let y2 = outerPadding;
                for (let idx = 0; idx < imgs.length; idx++) {
                  const im = imgs[idx];
                  const h = scaledHeights[idx];

                  // === FIX Part 4: Use final variables in the 2nd loop too ===
                  const x = finalX; // Use new centered X
                  ctx.drawImage(im, x, y2, finalContentWidth, h); // Use new scaled width
                  // === END FIX Part 4 ===

                  y2 += h + spacing;
                }

              } else {
                ctx.drawImage(o, 0, 0, canvas.width, canvas.height);
              }
            } catch (err) {
              console.warn("Overlay draw failed", err);
            }
            res(null);
          };
          o.onerror = () => res(null);
          o.src = overlaySrc;
        });
      }

      return canvas.toDataURL("image/png");
    };


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


    const runStrip = async () => {
      if (running) return;
      abortRef.current = false;
      setRunning(true);
      setPhotos([]);
      setFramedPhotos([]);

      for (let i = 0; i < maxPhotos; i++) {
        if (abortRef.current) break;

        for (let t = countdown; t > 0; t--) {
          setCurrentCount(t);

          await new Promise((r) => setTimeout(r, 1000));
          if (abortRef.current) break;
        }
        if (abortRef.current) break;
        setCurrentCount(0);

        shutterSounda.current.currentTime = 0;
        shutterSounda.current.play().catch((e) => console.warn("Sound play failed:", e));

        const raw = captureOnce();
        if (!raw) {

          console.warn("Failed to capture - video/canvas not ready");
          break;
        }

        setPhotos((p) => [...p, raw]);

        generateFramedDataUrl(raw, frame)
          .then((fd) => setFramedPhotos((fp) => [...fp, fd]))
          .catch(() => setFramedPhotos((fp) => [...fp, raw]));


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
        const overlaySrc =
          stripOverlay === "strip0"
            ? photoracca_strip_Frame0
            : stripOverlay === "strip1"
            ? photoracca_strip_Frame1
            : stripOverlay === "strip2"
            ? photoracca_strip_Frame2
            : stripOverlay === "strip3"
            ? photoracca_strip_Frame3
            : stripOverlay === "strip4"
            ? photoracca_strip_Frame4
            : stripOverlay === "strip5"
            ? photoracca_strip_Frame5
            : stripOverlay === "strip1Polaroid0"
            ? photoracca_strip_Frame_Polaroid0
            : stripOverlay === "strip1Polaroid1"
            ? photoracca_strip_Frame_Polaroid1
            : null;
        const strip = await composeStrip(
          toSave,
          12,
          "#fff",
          exportWidth,
          24,
          overlaySrc,
          "overlay",
          exportHeight
        );
        if (strip) downloadDataUrl(strip, "photoracca_strip.png");
        return strip;
      },
    }));


    useEffect(() => {
      return () => {
        shutterSounda.current.load();
        abortRef.current = true;
      };
    }, []);


    useEffect(() => {
      let mounted = true;
      const toUse = framedPhotos.length > 0 ? framedPhotos : photos;
      if (!toUse || toUse.length === 0) {
        setPreviewStrip(null);
        return;
      }
      const overlaySrc =
        stripOverlay === "strip0"
          ? photoracca_strip_Frame0
          : stripOverlay === "strip1"
          ? photoracca_strip_Frame1
          : stripOverlay === "strip2"
          ? photoracca_strip_Frame2
          : stripOverlay === "strip3"
          ? photoracca_strip_Frame3
          : stripOverlay === "strip4"
          ? photoracca_strip_Frame4
          : stripOverlay === "strip5"
          ? photoracca_strip_Frame5
          : stripOverlay === "strip1Polaroid0"
          ? photoracca_strip_Frame_Polaroid0
          : stripOverlay === "strip1Polaroid1"
          ? photoracca_strip_Frame_Polaroid1
          : null;
      (async () => {
        try {

          const preview = await composeStrip(
            toUse,
            8,
            "#fff",
            240,
            8,
            overlaySrc,
            "overlay"
          );
          if (mounted) setPreviewStrip(preview);
        } catch (e) {
          if (mounted) setPreviewStrip(null);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [framedPhotos, photos, stripOverlay]);

    return (
      <div className="multiplePhotoStripe" style={{ padding: 12 }}>
        <Helmet>
          <title>Photobooth Strip (Tall)</title>
          <meta
            name="description"
            content="Capture a vertical photobooth strip with frames and overlays using Photoracca Desktop."
          />
          <meta property="og:title" content="Photobooth Strip (Tall)" />
          <meta
            property="og:description"
            content="Capture a vertical photobooth strip with frames and overlays using Photoracca Desktop."
          />
          <meta property="og:image" content={photoracca_strip_Frame0} />
        </Helmet>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label>Style Preset:</label>
            <select
              className="select-design"
              value={preset}
              onChange={(e) => {
                const v = e.target.value;
                setPreset(v);

                switch (v) {
                  case "none":
                    setFrame("none");
                    setStripOverlay("none");
                    break;
                  case "polaroid":
                  case "rounded":
                  case "vintage":
                    setFrame(v);
                    setStripOverlay("none");
                    break;
                  case "strip0":
                    setFrame("none");
                    setStripOverlay("strip0");
                    break;
                  case "strip1":
                    setFrame("none");
                    setStripOverlay("strip1");
                    break;
                  case "polaroid_strip0":
                    setFrame("polaroid");
                    setStripOverlay("strip0");
                    break;
                  case "rounded_strip1":
                    setFrame("rounded");
                    setStripOverlay("strip1");
                    break;
                  default:
                    setFrame("none");
                    setStripOverlay("none");
                }
              }}
            >
              <option value="none">None</option>
              <option value="polaroid">Polaroid (photo)</option>
              <option value="rounded">Rounded (photo)</option>
              <option value="vintage">Vintage (photo)</option>
              <option value="strip0">PhotoRacca Strip 0 (strip)</option>
              <option value="strip1">PhotoRacca Strip 1 (strip)</option>
              <option value="polaroid_strip0">Polaroid + Strip 0</option>
              <option value="rounded_strip1">Rounded + Strip 1</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label>Frame:</label>
            <select
              className="select-design"
              value={frame}
              onChange={(e) => setFrame(e.target.value)}
            >
              <option value="none">None</option>
              <option value="polaroid">Polaroid</option>
              <option value="rounded">Rounded</option>
              <option value="vintage">Vintage</option>
              <option value="frame0">Frame (PNG overlay)</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label>Strip Overlay:</label>
            <select
              className="select-design"
              value={stripOverlay}
              onChange={(e) => setStripOverlay(e.target.value)}
            >
              <option value="none">None</option>
              <option value="strip0">Strip 0</option>
              <option value="strip1">Strip 1</option>
              <option value="strip2">Strip 2</option>
              <option value="strip3">Strip 3</option>
              <option value="strip4">Strip 4</option>
              <option value="strip5">Strip 5</option>
              <option value="strip1Polaroid0">Strip 0 for Polaroid Preset</option>
              <option value="strip1Polaroid1">Strip 1 for Polaroid Preset</option>
            </select>
          </div>

          {/* <button className="buttons-single" onClick={() => runStrip()} disabled={running}>
          Start Strip ({maxPhotos} photos)
        </button> */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label>Click Stop when stop shooting</label>
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
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label>Save Strip</label>
            <button
              className="buttons-single"
              onClick={async () => {
                const s = await (ref && ref.current && ref.current.saveStrip
                  ? ref.current.saveStrip()
                  : null);
                if (!s) {
                  const date1 = new Date().toISOString();
                  const strip = await composeStrip(
                    framedPhotos.length === photos.length
                      ? framedPhotos
                      : photos,
                    12,
                    "#fff",
                    exportWidth,
                    24,
                    null,
                    "overlay",
                    exportHeight
                  );
                  if (strip)
                    downloadDataUrl(strip, `photoracca_strip_${date1}.png`);
                }
              }}
            >
              Save Strip
            </button>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            marginTop: 12,
            top: 300,
            display: "flex",
            gap: 20
          }}
        >
          {running && currentCount > 0 && (
            <div style={{ fontSize: 70, fontWeight: "bold", color: "#ffffffff", position: "absolute", right: -920 }}>
              {currentCount}
            </div>
          )}


          {/* PREVIEW PANE Closed due to overridance */}
          {/* <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {(framedPhotos.length > 0 ? framedPhotos : photos).map((p, idx) => (
              <div key={idx} style={{ width: 120, position: "relative" }}>
                <img
                  src={p}
                  alt={`photo-shot-${idx}`}
                  style={{ width: "100%", display: "block" }}
                />
              </div>
            ))}
          </div> */}

          {/* Preview Stripe */}
          {previewStrip && (
            <div style={{ position: "absolute", marginTop: 12, right: -350, scale: 1.7 }}>
              <label>Strip Preview</label>
              <div style={{ width: 120, border: "1px solid #ddd", padding: 6 }}>
                <img
                  src={previewStrip}
                  alt="photobooth strip preview"
                  style={{ width: "100%", display: "block" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default MultiplePhotoStripeHeight;

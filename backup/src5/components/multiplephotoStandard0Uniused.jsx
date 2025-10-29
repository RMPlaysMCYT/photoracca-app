import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import PropTypes from "prop-types";

import "./css/buttons-multiple-photo.css";

/**
 * MultiplePhotoStandard
 * - Supports two printable layout targets: '2x6' (2in x 6in, vertical strip) and
 *   '4x6' (4in x 6in, standard 4x6 print). The component composes captured camera
 *   frames into the chosen printable canvas at a configurable PPI (defaults to 300).
 * - Users can pick a frame overlay (PNG) and an optional decoration overlay.
 * - mirrorPreview controls whether captured pixels are flipped horizontally to
 *   match the preview.
 *
 * Usage: include in pages and pass `videoRef` and `canvasRef` (hidden canvas). The
 * component exposes imperative methods via ref: startStrip() and getFinalData().
 */

const MultiplePhotoStandard = forwardRef(
  (
    {
      videoRef,
      canvasRef,
      countdown = 3,
      layout = "4x6", // '4x6' or '2x6'
      ppi = 300, // pixels per inch for final composed image
      mirrorPreview = false,
      maxPhotos = 4,
    },
    ref
  ) => {
    const [photos, setPhotos] = useState([]); // data URLs
    const [running, setRunning] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [count, setCount] = useState(0);
    const [frameOverlay, setFrameOverlay] = useState(null); // dataURL or url
    const [decoOverlay, setDecoOverlay] = useState(null);
    const [layoutState, setLayoutState] = useState(layout);
    const [showGuides, setShowGuides] = useState(true);
    const [frameScope, setFrameScope] = useState("canvas"); // 'canvas' or 'slot'
    const [shotsCount, setShotsCount] = useState(4); // 2 or 4
    const [borderMm, setBorderMm] = useState(4); // border around each slot in millimeters
    const [templates, setTemplates] = useState([]); // saved templates in-memory
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const frameImage = useRef(null);
    const decoImage = useRef(null);

    useEffect(() => {
      if (frameOverlay) {
        frameImage.current = new Image();
        frameImage.current.src = frameOverlay;
      } else {
        frameImage.current = null;
      }
      if (decoOverlay) {
        decoImage.current = new Image();
        decoImage.current.src = decoOverlay;
      } else {
        decoImage.current = null;
      }
    }, [frameOverlay, decoOverlay]);

    // determine how many slots and layout mapping
    const getLayoutSlots = () => {
      const chosen = layoutState || layout;
      // canvas physical size depends on chosen layout
      const canvasInches = chosen === "2x6" ? { w: 2, h: 6 } : { w: 4, h: 6 };

      // determine grid based on shotsCount; allow 2 or 4 shots
      let cols = 1;
      if (shotsCount === 4 && chosen === "4x6") cols = 2; // 2x2
      // otherwise keep single column (stacked)
      const rows = Math.ceil(shotsCount / cols);
      return { canvasInches, slots: shotsCount, grid: { cols, rows } };
    };

    const captureFrame = () => {
      const video = videoRef?.current;
      const canvas = canvasRef?.current;
      if (!video || !canvas) return null;
      if (!video.videoWidth || !video.videoHeight) return null;

      const ctx = canvas.getContext("2d");
      // size canvas to video source (do not use devicePixelRatio here; final composition handles PPI)
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (mirrorPreview) {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      return canvas.toDataURL("image/png");
    };

    const startStrip = async () => {
      const layoutInfo = getLayoutSlots();
      const total = layoutInfo.slots;
      setPhotos([]);
      setRunning(true);
      setCurrentIndex(0);

      for (let i = 0; i < total; i++) {
        // countdown per photo
        let c = countdown;
        setCount(c);
        while (c > 0) {
          // await a second
          // eslint-disable-next-line no-await-in-loop
          await new Promise((res) => setTimeout(res, 1000));
          c -= 1;
          setCount(c);
        }

        // capture
        // eslint-disable-next-line no-await-in-loop
        const data = captureFrame();
        if (data) {
          setPhotos((p) => [...p, data]);
          setCurrentIndex((idx) => idx + 1);
        }
        // small delay between captures
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, 250));
      }

      setRunning(false);
      setCount(0);
    };

    // Compose final printable canvas according to layout and overlays
    const composeFinal = async () => {
      const layoutInfo = getLayoutSlots();
      const inchesW = layoutInfo.canvasInches.w;
      const inchesH = layoutInfo.canvasInches.h;
      const finalW = Math.round(inchesW * ppi);
      const finalH = Math.round(inchesH * ppi);

      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = finalW;
      finalCanvas.height = finalH;
      const fctx = finalCanvas.getContext("2d");
      // white background
      fctx.fillStyle = "#ffffff";
      fctx.fillRect(0, 0, finalW, finalH);

      const { cols, rows } = layoutInfo.grid;
      const slots = layoutInfo.slots;

      // compute slot size in pixels
      const slotW = Math.floor(finalW / cols);
      const slotH = Math.floor(finalH / rows);
      // convert border (mm) to pixels
      const borderPx = Math.round((borderMm / 25.4) * ppi);

      for (let i = 0; i < slots; i++) {
        const imgDataUrl = photos[i];
        if (!imgDataUrl) continue;
        const img = await loadImage(imgDataUrl);

        // compute destination rect
        const col = i % cols;
        const row = Math.floor(i / cols);
        const dx = col * slotW;
        const dy = row * slotH;

        // draw the captured image centered & cover-like within inner slot (respecting border)
        const innerW = Math.max(1, slotW - 2 * borderPx);
        const innerH = Math.max(1, slotH - 2 * borderPx);
        const innerDx = dx + borderPx;
        const innerDy = dy + borderPx;
        const { sw, sh, sx, sy } = coverSourceRect(
          img.width,
          img.height,
          innerW,
          innerH
        );
        fctx.drawImage(img, sx, sy, sw, sh, innerDx, innerDy, innerW, innerH);

        // per-slot frame overlay is handled conditionally below; if frameScope === 'slot' draw it here
        if (frameImage.current && frameScope === "slot") {
          fctx.drawImage(frameImage.current, dx, dy, slotW, slotH);
        }
        // draw decoration overlay (on top of entire canvas or per-slot depending on user choice)
        if (decoImage.current) {
          // draw per-slot scaled the same as frame
          fctx.drawImage(decoImage.current, dx, dy, slotW, slotH);
        }

        // draw border area (visible border) if borderPx > 0
        if (borderPx > 0) {
          fctx.save();
          fctx.strokeStyle = "rgba(0,0,0,0.6)";
          fctx.lineWidth = Math.max(1, Math.round(ppi * 0.005));
          fctx.strokeRect(innerDx - 0.5, innerDy - 0.5, innerW + 1, innerH + 1);
          fctx.restore();
        }

        // draw guides for printing/cutting if enabled
        if (showGuides) {
          fctx.save();
          fctx.strokeStyle = "rgba(0,0,0,0.35)";
          fctx.lineWidth = Math.max(1, Math.round(ppi * 0.02)); // line relative to ppi
          fctx.setLineDash([4 * (ppi / 72), 4 * (ppi / 72)]);
          fctx.strokeRect(dx + 1, dy + 1, slotW - 2, slotH - 2);
          fctx.restore();
        }
      }

      // if frameScope is 'canvas', draw the frame overlay across the whole final canvas
      if (frameImage.current && frameScope === "canvas") {
        try {
          fctx.drawImage(frameImage.current, 0, 0, finalW, finalH);
        } catch (e) {
          // ignore draw errors
          console.warn("Failed to draw frame overlay across canvas", e);
        }
      }

      return finalCanvas.toDataURL("image/png");
    };

    const loadImage = (src) =>
      new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = src;
      });

    // helper to compute source rect that covers destination while maintaining aspect ratio
    const coverSourceRect = (sw, sh, dw, dh) => {
      const srcAspect = sw / sh;
      const dstAspect = dw / dh;
      let sx = 0;
      let sy = 0;
      let sWidth = sw;
      let sHeight = sh;
      if (srcAspect > dstAspect) {
        // source is wider -> crop horizontally
        sWidth = Math.round(sh * dstAspect);
        sx = Math.round((sw - sWidth) / 2);
      } else if (srcAspect < dstAspect) {
        // source is taller -> crop vertically
        sHeight = Math.round(sw / dstAspect);
        sy = Math.round((sh - sHeight) / 2);
      }
      return { sx, sy, sw: sWidth, sh: sHeight };
    };

    // Imperative handlers
    useImperativeHandle(ref, () => ({
      startStrip,
      async getFinalData() {
        if (photos.length === 0) return null;
        try {
          const data = await composeFinal();
          return data;
        } catch (e) {
          console.warn("Failed to compose final image", e);
          return null;
        }
      },
    }));

    // small inline UI for selecting frame/deco, starting, previewing
    return (
      <div className="multiplePhotoStandard">
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <label>
            Layout:
            <select
              value={layoutState}
              onChange={(e) => setLayoutState(e.target.value)}
            >
              <option value="4x6">4 x 6 (grid)</option>
              <option value="2x6">2 x 6 (strip)</option>
            </select>
          </label>

          <label>
            Shots:
            <select
              value={shotsCount}
              onChange={(e) => setShotsCount(Number(e.target.value))}
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </label>

          <label>
            Border (mm):
            <input
              type="number"
              min="0"
              max="50"
              value={borderMm}
              onChange={(e) => setBorderMm(Number(e.target.value))}
              style={{ width: 80 }}
            />
          </label>

          <label>
            Frame overlay:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return setFrameOverlay(null);
                const r = new FileReader();
                r.onload = () => setFrameOverlay(r.result);
                r.readAsDataURL(f);
              }}
            />
            {frameOverlay && (
              <button
                onClick={() => setFrameOverlay(null)}
                className="buttons-multiple"
              >
                Clear Frame
              </button>
            )}
          </label>
          <label>
            Frame scope:
            <select
              value={frameScope}
              onChange={(e) => setFrameScope(e.target.value)}
            >
              <option value="canvas">Whole canvas</option>
              <option value="slot">Per slot</option>
            </select>
          </label>

          <label>
            Decoration overlay:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return setDecoOverlay(null);
                const r = new FileReader();
                r.onload = () => setDecoOverlay(r.result);
                r.readAsDataURL(f);
              }}
            />
            {decoOverlay && (
              <button
                onClick={() => setDecoOverlay(null)}
                className="buttons-multiple"
              >
                Clear Deco
              </button>
            )}
          </label>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              placeholder="Template name"
              id="templateNameInput"
              style={{ width: 160 }}
            />
            <button
              className="buttons-multiple"
              onClick={() => {
                const el = document.getElementById("templateNameInput");
                const name = el ? el.value.trim() : "";
                if (!name) return alert("Please enter a template name");
                const tpl = {
                  name,
                  layout: layoutState,
                  shotsCount,
                  frameOverlay,
                  decoOverlay,
                  borderMm,
                  showGuides,
                  frameScope,
                };
                setTemplates((t) => [...t.filter((x) => x.name !== name), tpl]);
                setSelectedTemplate(name);
                if (el) el.value = "";
              }}
            >
              Save Template
            </button>

            <select
              value={selectedTemplate || ""}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="">Select template</option>
              {templates.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              className="buttons-multiple"
              onClick={() => {
                const tpl = templates.find((t) => t.name === selectedTemplate);
                if (!tpl) return;
                setLayoutState(tpl.layout);
                setShotsCount(tpl.shotsCount);
                setFrameOverlay(tpl.frameOverlay);
                setDecoOverlay(tpl.decoOverlay);
                setBorderMm(tpl.borderMm);
                setShowGuides(tpl.showGuides);
                setFrameScope(tpl.frameScope || "canvas");
              }}
            >
              Apply
            </button>
            <button
              className="buttons-multiple"
              onClick={() => {
                setTemplates((t) =>
                  t.filter((x) => x.name !== selectedTemplate)
                );
                setSelectedTemplate(null);
              }}
            >
              Delete
            </button>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={showGuides}
              onChange={(e) => setShowGuides(e.target.checked)}
            />
            Show print guides
          </label>

          <button
            onClick={() => startStrip()}
            disabled={running}
            className="buttons-multiple"
          >
            {running
              ? `Capturing... (${currentIndex}/${getLayoutSlots().slots})`
              : "Start Strip"}
          </button>

          <button
            onClick={async () => {
              const data = await composeFinal();
              if (data) {
                const a = document.createElement("a");
                a.href = data;
                a.download = `photoracca_strip_${layoutState}_${new Date().toISOString()}.png`;
                document.body.appendChild(a);
                a.click();
                a.remove();
              }
            }}
            disabled={photos.length === 0}
            className="buttons-multiple"
          >
            Download Final
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {photos.map((p, idx) => (
              <img
                key={idx}
                src={p}
                alt={`capture-${idx}`}
                style={{
                  width: 120,
                  height: 90,
                  objectFit: "cover",
                  border: "1px solid #ccc",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

MultiplePhotoStandard.displayName = "MultiplePhotoStandard";

MultiplePhotoStandard.propTypes = {
  videoRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  canvasRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  countdown: PropTypes.number,
  layout: PropTypes.oneOf(["4x6", "2x6"]),
  ppi: PropTypes.number,
  mirrorPreview: PropTypes.bool,
  maxPhotos: PropTypes.number,
};

export default MultiplePhotoStandard;

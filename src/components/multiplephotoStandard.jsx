import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
} from "react";
import PropTypes from "prop-types";
import {
  saveFrame,
  getAllFrames,
  deleteFrame,
  getFramesByLayout,
} from "../utils/frameStorage";

import "./css/buttons.css";
import "./css/MultiPhotStanCtrl.css";
import "./css/MultiPhotStanMgr.css";
import "./css/MultiPhotStanFrameMgr.css";

// Optional: import icons if lucide-react is installed, otherwise use text fallbacks
let Trash2, Save, Upload, X;
try {
  const lucide = require("lucide-react");
  Trash2 = lucide.Trash2 || (() => "🗑️");
  Save = lucide.Save || (() => "💾");
  Upload = lucide.Upload || (() => "📁");
  X = lucide.X || (() => "✕");
} catch {
  // Fallback text icons if lucide-react is not installed
  Trash2 = () => <span>🗑️</span>;
  Save = () => <span>💾</span>;
  Upload = () => <span>📁</span>;
  X = () => <span>✕</span>;
}

// Optional: import shutter sound if it exists
let shutterSound = null;
try {
  shutterSound = require("../audio/shutter.mp3");
} catch {
  console.log("Shutter sound not found, continuing without audio");
}

const MultiplePhotoStandard = forwardRef(
  (
    {
      videoRef,
      canvasRef,
      countdown = 3,
      layout = "4x6",
      ppi = 300,
      mirrorPreview = false,
      maxPhotos = 4,
    },
    ref
  ) => {
    const [photos, setPhotos] = useState([]);
    const [running, setRunning] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [count, setCount] = useState(0);
    const [frameOverlay, setFrameOverlay] = useState(null);
    const [decoOverlay, setDecoOverlay] = useState(null);
    const [layoutState, setLayoutState] = useState(layout);
    const [showGuides, setShowGuides] = useState(false);
    const [frameScope, setFrameScope] = useState("canvas");
    const [shotsCount, setShotsCount] = useState(4);
    const [borderMm, setBorderMm] = useState(3.5);
    const [topReservedMm, setTopReservedMm] = useState(0);
    const [bottomReservedMm, setBottomReservedMm] = useState(0);

    // Frame management states
    const [savedFrames, setSavedFrames] = useState([]);
    const [selectedFrameId, setSelectedFrameId] = useState(null);
    const [frameName, setFrameName] = useState("");
    const [showFrameManager, setShowFrameManager] = useState(false);
    const [showDecorationFrameManager, setShowDecorationFrameManager] =
      useState(false);

    const [showDecoFrameManager, setShowDecoFrameManager] = useState(false);
    const [frameManagerPos, setFrameManagerPos] = useState({ x: 40, y: 120 });
    const [isDraggingFrameManager, setIsDraggingFrameManager] = useState(false);

    const shutterAudio = useRef(shutterSound ? new Audio(shutterSound) : null);
    const frameInputRef = useRef(null);
    const decoInputRef = useRef(null);
    const frameDragOffsetRef = useRef({ x: 0, y: 0 });

    // Preloaded overlay images to ensure deterministic drawing
    const frameImageRef = useRef(null);
    const decoImageRef = useRef(null);

    // Load saved frames function
    const loadFrames = async () => {
      try {
        const frames = await getFramesByLayout(layoutState);
        setSavedFrames(frames);
      } catch (e) {
        console.warn("Failed to load frames:", e);
      }
    };

    // Load saved frames on mount and when layout changes
    useEffect(() => {
      loadFrames();
    }, [layoutState]);

    // Handle frame file upload
    const handleFrameUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        setFrameOverlay(evt.target.result);
        setSelectedFrameId(null); // Clear selection when uploading new
      };
      reader.readAsDataURL(file);
    };

    // Handle decoration upload
    const handleDecoUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        setDecoOverlay(evt.target.result);
      };
      reader.readAsDataURL(file);
    };

    // Save current frame to IndexedDB
    const handleSaveFrame = async () => {
      if (!frameOverlay) {
        window.alert("Please upload a frame first");
        return;
      }
      if (!frameName.trim()) {
        window.alert("Please enter a frame name");
        return;
      }

      try {
        await saveFrame({
          name: frameName.trim(),
          dataUrl: frameOverlay,
          scope: frameScope,
          layoutType: layoutState,
          borderMm,
        });

        setFrameName("");
        await loadFrames();
        window.alert("Frame saved successfully!");
      } catch (e) {
        window.alert("Failed to save frame: " + e.message);
      }
    };

    // Preload frame overlay image when data changes
    useEffect(() => {
      if (!frameOverlay) {
        frameImageRef.current = null;
        return;
      }
      const img = new Image();
      img.onload = () => {
        frameImageRef.current = img;
      };
      img.onerror = () => {
        frameImageRef.current = null;
      };
      img.src = frameOverlay;
    }, [frameOverlay]);

    // Preload decoration overlay image when data changes
    useEffect(() => {
      if (!decoOverlay) {
        decoImageRef.current = null;
        return;
      }
      const img = new Image();
      img.onload = () => {
        decoImageRef.current = img;
      };
      img.onerror = () => {
        decoImageRef.current = null;
      };
      img.src = decoOverlay;
    }, [decoOverlay]);

    // Load a saved frame
    const handleLoadFrame = async (frameId) => {
      const frame = savedFrames.find((f) => f.id === frameId);
      if (!frame) return;

      setFrameOverlay(frame.dataUrl);
      setFrameScope(frame.scope);
      setBorderMm(frame.borderMm || 0);
      setSelectedFrameId(frameId);
    };

    // Delete a saved frame
    const handleDeleteFrame = async (frameId) => {
      if (!window.confirm("Delete this frame?")) return;

      try {
        await deleteFrame(frameId);
        if (selectedFrameId === frameId) {
          setFrameOverlay(null);
          setSelectedFrameId(null);
        }
        await loadFrames();
      } catch (e) {
        window.alert("Failed to delete frame: " + e.message);
      }
    };

    const handleFrameManagerDragStart = (event) => {
      event.preventDefault();
      const pointer = event.touches ? event.touches[0] : event;
      frameDragOffsetRef.current = {
        x: pointer.clientX - frameManagerPos.x,
        y: pointer.clientY - frameManagerPos.y,
      };
      setIsDraggingFrameManager(true);
    };

    useEffect(() => {
      if (!isDraggingFrameManager) return undefined;

      const handleMove = (event) => {
        const pointer = event.touches ? event.touches[0] : event;
        setFrameManagerPos(() => {
          const candidateX = pointer.clientX - frameDragOffsetRef.current.x;
          const candidateY = pointer.clientY - frameDragOffsetRef.current.y;
          const maxX = Math.max(16, (window.innerWidth || 0) - 360);
          const maxY = Math.max(16, (window.innerHeight || 0) - 140);
          return {
            x: Math.min(Math.max(16, candidateX), maxX),
            y: Math.min(Math.max(16, candidateY), maxY),
          };
        });
      };

      const stopDrag = () => setIsDraggingFrameManager(false);

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", stopDrag);
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("touchend", stopDrag);
      window.addEventListener("touchcancel", stopDrag);

      return () => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", stopDrag);
        window.removeEventListener("touchmove", handleMove);
        window.removeEventListener("touchend", stopDrag);
        window.removeEventListener("touchcancel", stopDrag);
      };
    }, [isDraggingFrameManager]);

    // Capture logic (same as before with mirror support)
    useImperativeHandle(ref, () => ({
      startStrip: () => {
        if (running) return;
        setPhotos([]);
        setCurrentIndex(0);
        setRunning(true);
        setCount(countdown);
      },
      getFinalData: async () => {
        if (photos.length === 0) return null;
        return composeFinalImage();
      },
    }));

    useEffect(() => {
      if (!running) return;
      if (currentIndex >= shotsCount) {
        setRunning(false);
        return;
      }

      if (count > 0) {
        const timer = setTimeout(() => setCount(count - 1), 1000);
        return () => clearTimeout(timer);
      }

      // Capture frame
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (
        !video ||
        !canvas ||
        video.videoWidth === 0 ||
        video.videoHeight === 0 ||
        (video.readyState !== undefined && video.readyState < 2)
      ) {
        console.warn("Video not ready, retrying capture shortly...");
        const retry = setTimeout(() => {
          // trigger capture branch again without restarting whole strip
          setCount(0);
        }, 200);
        return () => clearTimeout(retry);
      }

      shutterAudio.current?.play().catch(() => {});

      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.save();
      if (mirrorPreview) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const dataUrl = canvas.toDataURL("image/png");
      setPhotos((prev) => [...prev, dataUrl]);
      setCurrentIndex((prev) => prev + 1);
      setCount(countdown);
    }, [
      running,
      count,
      currentIndex,
      shotsCount,
      countdown,
      mirrorPreview,
      videoRef,
      canvasRef,
    ]);

    // Compose final printable image
    const composeFinalImage = () => {
      return new Promise((resolve) => {
        const inchW = layoutState === "4x6" ? 4 : 2;
        const inchH = 6;
        const canvasW = Math.round(inchW * ppi);
        const canvasH = Math.round(inchH * ppi);

        const finalCanvas = document.createElement("canvas");
        finalCanvas.width = canvasW;
        finalCanvas.height = canvasH;
        const ctx = finalCanvas.getContext("2d");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasW, canvasH);

        const actualShots = Math.min(photos.length, shotsCount);
        let cols, rows;
        if (layoutState === "4x6") {
          if (actualShots === 4) {
            cols = 2;
            rows = 2;
          } else {
            cols = 1;
            rows = actualShots;
          }
        } else {
          cols = 1;
          rows = actualShots;
        }

        const slotW = canvasW / cols;
        const borderPx = (borderMm / 25.4) * ppi;
        const topReservedPx = Math.max(0, (topReservedMm / 25.4) * ppi);
        const bottomReservedPx = Math.max(0, (bottomReservedMm / 25.4) * ppi);
        const availableHeight = Math.max(
          1,
          canvasH - topReservedPx - bottomReservedPx
        );
        const slotH = availableHeight / rows;

        const drawSlot = (img, col, row) => {
          const x = col * slotW;
          const y = topReservedPx + row * slotH;
          const innerW = slotW - 2 * borderPx;
          const innerH = slotH - 2 * borderPx;
          const innerX = x + borderPx;
          const innerY = y + borderPx;

          const imgAspect = img.width / img.height;
          const slotAspect = innerW / innerH;
          let drawW, drawH, offsetX, offsetY;

          if (imgAspect > slotAspect) {
            drawH = innerH;
            drawW = drawH * imgAspect;
            offsetX = (innerW - drawW) / 2;
            offsetY = 0;
          } else {
            drawW = innerW;
            drawH = drawW / imgAspect;
            offsetX = 0;
            offsetY = (innerH - drawH) / 2;
          }

          ctx.save();
          ctx.beginPath();
          ctx.rect(innerX, innerY, innerW, innerH);
          ctx.clip();
          ctx.drawImage(img, innerX + offsetX, innerY + offsetY, drawW, drawH);
          ctx.restore();

          if (borderPx > 0) {
            ctx.strokeStyle = "#333";
            ctx.lineWidth = 1;
            ctx.strokeRect(innerX, innerY, innerW, innerH);
          }

          if (frameScope === "slot" && frameImageRef.current) {
            ctx.drawImage(frameImageRef.current, x, y, slotW, slotH);
          }

          if (decoImageRef.current) {
            ctx.drawImage(decoImageRef.current, x, y, slotW, slotH);
          }
        };

        const loadedImages = [];
        let loadedCount = 0;

        photos.slice(0, actualShots).forEach((dataUrl, i) => {
          const img = new Image();
          img.onload = () => {
            loadedImages[i] = img;
            loadedCount++;
            if (loadedCount === actualShots) {
              loadedImages.forEach((img, idx) => {
                const col = idx % cols;
                const row = Math.floor(idx / cols);
                drawSlot(img, col, row);
              });

              if (frameScope === "canvas" && frameImageRef.current) {
                ctx.drawImage(frameImageRef.current, 0, 0, canvasW, canvasH);
                if (showGuides) {
                  ctx.strokeStyle = "rgba(0,0,0,0.3)";
                  ctx.setLineDash([5, 5]);
                  ctx.lineWidth = 1;
                  for (let c = 1; c < cols; c++)
                    ctx.strokeRect(
                      c * slotW,
                      topReservedPx,
                      0,
                      availableHeight
                    );
                  for (let r = 1; r < rows; r++)
                    ctx.strokeRect(0, topReservedPx + r * slotH, canvasW, 0);
                }
                resolve(finalCanvas.toDataURL("image/png"));
              } else {
                if (showGuides) {
                  ctx.strokeStyle = "rgba(0,0,0,0.3)";
                  ctx.setLineDash([5, 5]);
                  ctx.lineWidth = 1;
                  for (let c = 1; c < cols; c++)
                    ctx.strokeRect(
                      c * slotW,
                      topReservedPx,
                      0,
                      availableHeight
                    );
                  for (let r = 1; r < rows; r++)
                    ctx.strokeRect(0, topReservedPx + r * slotH, canvasW, 0);
                }
                resolve(finalCanvas.toDataURL("image/png"));
              }
            }
          };
          img.src = dataUrl;
        });
      });
    };

    const downloadFinal = async () => {
      const dataUrl = await composeFinalImage();
      if (!dataUrl) return;

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `photoracca_${layoutState}_${shotsCount}shots_${Date.now()}.png`;
      link.click();
    };

    return (
      <div className="MultiPhotStanCtrl">
        <div className="LayoutSelector" style={{ padding: 20 }}>
          <h3>Multiple Photo Standard</h3>

          {/* Layout & Shots Controls */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 12,
              flexWrap: "wrap",
              alignItems: "center"
            }}
          >
            <label className="">
              Layout:
              <select
                value={layoutState}
                onChange={(e) => setLayoutState(e.target.value)}
              >
                <option value="4x6">4×6 inch</option>
                <option value="2x6">2×6 inch</option>
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

            {layoutState === "2x6" && (
              <>
                <label>
                  Top spacing (mm):
                  <input
                    type="number"
                    min="0"
                    max="120"
                    step="1"
                    value={topReservedMm}
                    onChange={(e) => setTopReservedMm(Number(e.target.value))}
                    style={{ width: 70 }}
                  />
                </label>
                <label>
                  Bottom spacing (mm):
                  <input
                    type="number"
                    min="0"
                    max="120"
                    step="1"
                    value={bottomReservedMm}
                    onChange={(e) =>
                      setBottomReservedMm(Number(e.target.value))
                    }
                    style={{ width: 70 }}
                  />
                </label>
              </>
            )}

            {/* <label>
            Border (mm):
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={borderMm}
              onChange={(e) => setBorderMm(Number(e.target.value))}
              style={{ width: 60 }}
            />
          </label> */}

            {/* <label>
            Frame scope:
            <select
              value={frameScope}
              onChange={(e) => setFrameScope(e.target.value)}
            >
              <option value="canvas">Whole canvas</option>
              <option value="slot">Per slot</option>
            </select>
          </label> */}

            {/* <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="checkbox"
              checked={showGuides}
              onChange={(e) => setShowGuides(e.target.checked)}
            />
            Show print guides
          </label> */}

            <button
              className="ButtonDesign0"
              onClick={() => setShowDecoFrameManager(!showDecoFrameManager)}
            >
              {showDecoFrameManager ? "Hide" : "Show"} Manager
            </button>
          </div>

          {showDecoFrameManager && (
            <div
              className="floating-frame-manager"
              style={{
                position: "fixed",
                top: frameManagerPos.y,
                left: frameManagerPos.x,
                width: 400,
                maxHeight: "80vh",
                overflowY: "auto",
                background: "#ffffff",
                border: "1px solid #ccc",
                borderRadius: 8,
                boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
                zIndex: 1500,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "#bab3b3ff",
                  color: "#fff",
                  cursor: "move",
                  userSelect: "none",
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                }}
                onMouseDown={handleFrameManagerDragStart}
                onTouchStart={handleFrameManagerDragStart}
              >
                <strong>Frame Manager</strong>
                <button
                  onClick={() => setShowDecoFrameManager(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                  aria-label="Close frame manager"
                >
                  ×
                </button>
              </div>
              <div style={{ padding: 12 }}>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 8,
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <h4 style={{ margin: 0 }}>Custom Frames</h4>
                  <button
                    className="MulPhotBtn"
                    onClick={() => setShowFrameManager(!showFrameManager)}
                    style={{ fontSize: 12 }}
                  >
                    {showFrameManager ? "Hide" : "Show"} Library
                  </button>
                </div>

                {showFrameManager && (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      <input
                        ref={frameInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFrameUpload}
                        style={{ display: "none" }}
                      />
                      <button
                        onClick={() => frameInputRef.current?.click()}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Upload size={16} /> Upload Frame Image
                      </button>
                      {frameOverlay && !selectedFrameId && (
                        <button
                          onClick={() => setFrameOverlay(null)}
                          style={{ marginLeft: 8 }}
                        >
                          <X size={16} /> Clear
                        </button>
                      )}
                    </div>

                    {frameOverlay && !selectedFrameId && (
                      <div
                        style={{ display: "flex", gap: 8, marginBottom: 12 }}
                      >
                        <input
                          type="text"
                          placeholder="Frame name..."
                          value={frameName}
                          onChange={(e) => setFrameName(e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <button
                          onClick={handleSaveFrame}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Save size={16} /> Save Frame
                        </button>
                      </div>
                    )}

                    {savedFrames.length > 0 && (
                      <div>
                        <p style={{ fontSize: 12, margin: "8px 0 4px" }}>
                          Saved frames for {layoutState}:
                        </p>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          {savedFrames.map((frame) => (
                            <div
                              key={frame.id}
                              style={{
                                border:
                                  selectedFrameId === frame.id
                                    ? "2px solid #007bff"
                                    : "1px solid #ccc",
                                borderRadius: 4,
                                padding: 8,
                                cursor: "pointer",
                                background:
                                  selectedFrameId === frame.id
                                    ? "#e7f3ff"
                                    : "#fff",
                                position: "relative",
                              }}
                              onClick={() => handleLoadFrame(frame.id)}
                            >
                              <img
                                src={frame.dataUrl}
                                alt={frame.name}
                                style={{
                                  width: 60,
                                  height: 60,
                                  objectFit: "contain",
                                  display: "block",
                                }}
                              />
                              <p
                                style={{
                                  margin: "4px 0 0",
                                  fontSize: 11,
                                  textAlign: "center",
                                }}
                              >
                                {frame.name}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFrame(frame.id);
                                }}
                                style={{
                                  position: "absolute",
                                  top: 2,
                                  right: 2,
                                  padding: 2,
                                  background: "#ff4444",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 2,
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div style={{ marginTop: 16 }}>
                  <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 8,
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                  >
                    <h4 style={{ margin: "0 0 8px" }}>
                      Custom Decoration Overlay
                    </h4>
                    <button
                      className="MulPhotBtn"
                      onClick={() =>
                        setShowDecorationFrameManager(
                          !showDecorationFrameManager
                        )
                      }
                      style={{ fontSize: 12 }}
                    >
                      {showDecorationFrameManager ? "Hide" : "Show"} Library
                    </button>
                  </div>
                  {showDecorationFrameManager && (
                    <>
                      <div>
                        <input
                          ref={decoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleDecoUpload}
                          style={{ display: "none" }}
                        />
                        <button onClick={() => decoInputRef.current?.click()}>
                          <Upload size={16} /> Upload Decoration
                        </button>
                        {decoOverlay && (
                          <button
                            onClick={() => setDecoOverlay(null)}
                            style={{ marginLeft: 8 }}
                          >
                            <X size={16} /> Clear Deco
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Capture UI */}
          {running && (
            <div
              style={{
                position: "absolute",
                top: 300,
                left: 440,
                fontSize: 48,
                textAlign: "center",
                margin: "20px 0",
              }}
            >
              {count > 0 ? count : "📸"}
            </div>
          )}

          {/* Thumbnails */}
          {photos.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              {photos.map((p, i) => (
                <img
                  key={i}
                  src={p}
                  alt={`shot ${i + 1}`}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    border: "1px solid #ccc",
                  }}
                />
              ))}
            </div>
          )}

          {/* Download */}
          {photos.length === shotsCount && (
            <button onClick={downloadFinal} style={{ marginTop: 12 }}>
              Save Photo ({layoutState}, {shotsCount} shots)
            </button>
          )}
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

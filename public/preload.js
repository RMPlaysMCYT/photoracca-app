const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  printStrip: (payload) => ipcRenderer.invoke("print-strip", payload),
  getPrinters: () => ipcRenderer.invoke("list-printers"),
  windowControl: (action) => ipcRenderer.send("window-control", action),
  onWindowStateChange: (callback) =>
    ipcRenderer.on("window-state-changed", callback),
});

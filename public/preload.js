const { contextBridge, ipcRenderer, ipcMain } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printStrip: (payload) => ipcRenderer.send('print-strip', payload),
  windowControl: (action) => ipcRenderer.send('window-control', action),
  onWindowStateChange: (callback) => ipcRenderer.on('window-state-changed', callback)
});

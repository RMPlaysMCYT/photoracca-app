const { app, BrowserWindow } = require('electron');
const path = require('path');
// const isDev = require('electron-is-dev');

function createWindow() {
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    frame: false,
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // const urlToLoad = isDev ? 'build' : `file://${path.join(__dirname, 'index.html')}`;
  // mainWindow.loadURL(urlToLoad);

  mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html')); // Adjust 'build' path as needed

  // if (isDev) {
  //   mainWindow.webContents.openDevTools(false);
  // }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
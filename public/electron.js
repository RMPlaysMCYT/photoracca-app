const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
// const isDev = require('electron-is-dev');

function createWindow() {
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    frame: false,
    width: 1920,
    height: 1080,
    icon: path.join(__dirname, 'favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // const urlToLoad = isDev ? 'build' : `file://${path.join(__dirname, 'index.html')}`;
  // mainWindow.loadURL(urlToLoad);
  mainWindow.removeMenu();
  mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html')); // Adjust 'build' path as needed

  // if (isDev) {
  //   mainWindow.webContents.openDevTools(false);
  // }
}

app.on("browser-window-created", (e, win) => {
    win.removeMenu();
});

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


//Damn this is for printing yet to be test
ipcMain.handle("list-printers", (event) => {
  return event.sender.getPrintersAsync();
});

ipcMain.handle("print-strip", async (_event, { dataUrl, layout, deviceName }) => {
  const printWin = new BrowserWindow({
    show: false,
    webPreferences: { offscreen: true }
  });

  const pageWidthMicrons = (layout === "2x6" ? 2 : 4) * 25400; // Electron expects µm
  const pageHeightMicrons = 6 * 25400;

  const html = `
    <html>
      <head>
        <style>
          @page { size: ${layout === "2x6" ? "2in 6in" : "4in 6in"}; margin:0; }
          html,body { margin:0; padding:0; width:100%; height:100%; }
          body { display:flex; align-items:center; justify-content:center; background:#fff; }
          img { width:100%; height:100%; object-fit:contain; }
        </style>
      </head>
      <body><img src="${dataUrl}" /></body>
    </html>`;
  await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  return new Promise((resolve, reject) => {
    printWin.webContents.print({
      silent: true,
      printBackground: true,
      deviceName: deviceName || undefined,
      margins: { marginType: "none" },
      pageSize: { width: pageWidthMicrons, height: pageHeightMicrons }
    }, (success, failureReason) => {
      printWin.close();
      if (!success) reject(new Error(failureReason));
      else resolve();
    });
  });
});
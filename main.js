const { app, BrowserWindow, ipcMain } = require("electron");
const { exec } = require("child_process");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

ipcMain.on("launch-app", (event, command) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error launching ${command}: ${error.message}`);
    } else {
      console.log(`Launched ${command}: ${stdout}`);
    }
  });
});

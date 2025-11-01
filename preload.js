const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  launchApp: (command) => ipcRenderer.send("launch-app", command),
  onCommandComplete: (callback) => ipcRenderer.on("command-complete", callback),
});

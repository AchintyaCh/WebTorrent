const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

// Enable live reload for development
if (process.env.NODE_ENV === "development") {
  try {
    require("electron-reload")(__dirname, {
      electron: path.join(__dirname, "..", "node_modules", ".bin", "electron"),
      hardResetMethod: "exit",
    });
  } catch (error) {
    console.log("electron-reload not available in production");
  }
}

let mainWindow;
let viteProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, "../public/square.png"),
    show: false,
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, "../dist/index.html");
mainWindow.loadFile(indexPath).catch((err) => {
  console.error("Failed to load:", err);
  mainWindow.loadURL(
    `data:text/html,<h1>Failed to load index.html</h1><p>${err.message}</p>`
  );
});
  }

  mainWindow.once("ready-to-show", () => mainWindow.show());
}

// Enhanced P2P and UPnP support with better security
app.whenReady().then(() => {
  createWindow();

  // Enable experimental features for better P2P support
  app.commandLine.appendSwitch("enable-experimental-web-platform-features");
  app.commandLine.appendSwitch("enable-webrtc-stun-origin");

  // Security: Only disable web security for specific domains if needed
  // app.commandLine.appendSwitch('disable-web-security');
  // app.commandLine.appendSwitch('allow-running-insecure-content');

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (viteProcess) {
      viteProcess.kill();
    }
    app.quit();
  }
});

// IPC handlers for enhanced file operations
ipcMain.handle("select-files", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "All Files", extensions: ["*"] }],
  });
  return result;
});

ipcMain.handle("select-download-folder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  return result;
});

ipcMain.handle("save-file", async (event, fileName, buffer) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: fileName,
    filters: [{ name: "All Files", extensions: ["*"] }],
  });

  if (!result.canceled) {
    fs.writeFileSync(result.filePath, buffer);
    return { success: true, path: result.filePath };
  }
  return { success: false };
});

ipcMain.handle("open-external", async (event, url) => {
  shell.openExternal(url);
});

// Network and UPnP discovery helpers
ipcMain.handle("get-network-info", async () => {
  const os = require("os");
  const networkInterfaces = os.networkInterfaces();
  const localIPs = [];

  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((interface) => {
      if (interface.family === "IPv4" && !interface.internal) {
        localIPs.push(interface.address);
      }
    });
  });

  return {
    localIPs,
    platform: process.platform,
    arch: process.arch,
  };
});


const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectDownloadFolder: () => ipcRenderer.invoke('select-download-folder'),
  saveFile: (fileName, buffer) => ipcRenderer.invoke('save-file', fileName, buffer),
  
  // External operations
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Network information
  getNetworkInfo: () => ipcRenderer.invoke('get-network-info'),
  
  // Platform information
  platform: process.platform,
  arch: process.arch,
  
  // Environment
  isElectron: true,
  isDevelopment: process.env.NODE_ENV === 'development'
});

// Expose a minimal set of APIs for WebTorrent functionality
contextBridge.exposeInMainWorld('webtorrentAPI', {
  // Add any WebTorrent-specific APIs here
  // For now, we'll use the general electronAPI
});

// src/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
  getProductImages: async productName => {
    try {
      const response = await ipcRenderer.invoke('getProductImages', productName);
      return response.images;
    } catch (error) {
      console.error('Error loading images:', error);
      return [];
    }
  },
  saveFile: async (base64Data, fileName) => {
    try {
      const result = await ipcRenderer.invoke('save-file', base64Data, fileName);
      return result;
    } catch (error) {
      console.error('Error invoking save-file:', error);
      return false;
    }
  },

  deleteFile: async (fileName) => {
    try {
      const result = await ipcRenderer.invoke('delete-file', fileName);
      return result;
    } catch (error) {
      console.error('Error invoking save-file:', error);
      return false;
    }
  }
});
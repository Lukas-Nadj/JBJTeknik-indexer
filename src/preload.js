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
  },

  openFile: async (filePath) => {
    try {
      window.open(filePath, '_blank', 'top=200,left=500,height=800,nodeIntegration=no,title:'+filePath);

      return result;
    } catch (error) {
      console.error('Error invoking save-file:', error);
      return false;
    }
  },

  getPath: async() => {
    try {
      const result = await ipcRenderer.invoke('get-path');
      return await result;
    } catch (error) {
      console.error('Error invoking save-file:', error);
      return false;
    }
  },

  SaveToJSON: async(jsonString) => {
    try {
      const result = await ipcRenderer.invoke('SaveToJSON', jsonString);
      return result;
    } catch (error) {
      console.error('Error invoking save-file:', error);
      return false;
    }
  },


  loadJSON: async() => {
    try {
      const result = await ipcRenderer.invoke('loadJSON');
      return result;
    } catch (error) {
      console.error('Error invoking save-file:', error);
      return false;
    }
  }
});
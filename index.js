const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const contextMenu = require("electron-context-menu");

contextMenu({
  showSaveImageAs: true,
  showInspectElement: false,
});
let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 800,
    icon: "Logo.png",
    webPreferences: {
      preload: path.join(__dirname, "src/preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile("public/index.html"); // Adjust the path to your HTML file
  mainWindow.webContents.openDevTools();
});

ipcMain.handle("getProductImages", async (event, productName) => {
  const productFolderPath = path.join(app.getPath("userData"), "data", productName);
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp"];
  try {
    const files = await fs.promises.readdir(productFolderPath);
    const imageNames = files.filter((file) => {
      return imageExtensions.some((extension) => file.endsWith(extension));
    });

    const imageSrc = new Array(imageNames.length);
    for (let i = 0; i<imageSrc.length; i++) {
      imageSrc[i] = path.join(app.getPath("userData"), "data", productName, imageNames[i]);
    }

    //console.log(app.getPath("userData"), "data", productName);
    //console.log("\n", imageSrc);
    return { images: imageSrc };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('save-file', async (event, binaryData, fileName) => {
    try {
      // Convert the ArrayBuffer to a Buffer
      const bufferData = Buffer.from(binaryData);
  
      // Construct the file path
      const filePath = path.join(app.getPath("userData"), fileName);
      const directoryPath = path.dirname(filePath);
      
      await fs.promises.mkdir(directoryPath, { recursive: true });
      // Write the file to the specified path
      await fs.promises.writeFile(filePath, bufferData);
  
      return true; // Return success
    } catch (error) {
      console.error('Error saving file:', error);
      return false; // Return failure
    }
  });

  ipcMain.handle('delete-file', async (event, fileName) => {
    try {  
      // Construct the file path
      const filePath = fileName;
      console.log("\n"+ filePath +"\n");
       fs.unlink(filePath, (err) => {
        if (err) throw err;
        console.log('successfully deleted /tmp/hello');
      });
      return true; // Return success
    } catch (error) {
      console.error('Error deleting file:', error);
      return false; // Return failure
    }
  });

  ipcMain.handle('get-path', async (event) => {
    try {  
      return app.getPath("userData");
    } catch (error) {
      return error; // Return failure
    }

  });

const { app, BrowserWindow, ipcMain, Tray } = require("electron");
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
    icon: "Icon.png",
    webPreferences: {
      preload: path.join(__dirname, "src/preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });
  mainWindow.removeMenu();
  mainWindow.loadFile("public/index.html"); // Adjust the path to your HTML file
  
});

app.on('window-all-closed', () => {
  //request json from frontend
  //saveToJSON()
  app.quit();
})

ipcMain.handle("getProductImages", async (event, productName) => {
  const productFolderPath = path.join(app.getPath("userData"), "data", productName);
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp"];
  try {
    const files = await fs.promises.readdir(productFolderPath);
    const imageNames = files

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

  ipcMain.handle('loadJSON', async (event) => {
    try {  
      let rawdata = fs.readFileSync(path.join(app.getPath("userData"),'varer.json')); //stopper programmer indtil den har læst data, hvilket er passende
      return JSON.parse(rawdata);
    } catch (error) {
      return error; // Return failure
    }

  });

  ipcMain.handle('SaveToJSON', async (event, data) => {
    try {  
      fs.writeFile(path.join(app.getPath("userData"),'varer.json'), data,(err) => {
        if (err) throw err;
        console.log('Data written to file'); 
        });
      console.log("Successfully wrote to: \n"+path.join(app.getPath("userData"),'varer.json'));
      return "Successfully wrote to: \n"+path.join(app.getPath("userData"),'varer.json');
    } catch (error) {
      return error; // Return failure
    }
  });


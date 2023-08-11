let fileData = "";
const dropzone = document.getElementById("clickable-area");

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
});

async function saveFile(filename) {
  if (fileData) {
    const success = await window.electronApi.saveFile(fileData, "public/data/"+productName+"/"+filename);
    if (success) {
      console.log("File saved successfully");
    } else {
      console.error("Failed to save file");
    }
  }
}

async function handleDrop(event) {
  event.preventDefault();
  console.log("reading files: ", event.dataTransfer.files[0]);
  const file = event.dataTransfer.files[0];

  


  if (file) {
    fileData = await readFile(file);
  }
  let img = {name: file.name, src:"../public/data/"+productName+"/"+file.name};
  saveFile(file.name);
  setTimeout(() => {window.addImage(img);}, 1000);
}

async function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
}

dropzone.addEventListener("dragover", (event) => event.preventDefault());
dropzone.addEventListener("drop", handleDrop);

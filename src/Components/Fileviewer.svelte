<script>
  export let images;
  export let loading;

  async function deletefile(imagename) {
    let success = window.electronApi.deleteFile(imagename);
    if (success) {
      for (let i = 0; i < images.length; i++) {
        if (images[i].name === imagename) {
          console.log(images[i]);
          console.log("found it, deleting it", i, images[i].name, imagename);
          images.splice(i, 1);
          images = images;
        }
      }
    } else {
      console.log(success);
    }
  }
  let path = window.electronApi.getPath();
  const imageExtensions = [".apng", ".avif", ".bmp", ".gif", ".ico", ".cur", ".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp", ".png", ".svg", ".webp"];


  function imgfile(str){
    for(let i = 0; i< imageExtensions.length;i++){
      if (str.endsWith(imageExtensions[i])){
        console.log("true");
        return true;
      }
    }
    return false;
  }

  function viewFile(src){
    window.electronApi.openFile(src);
  }

</script>

<main>
  {#if loading}
    <p>loader billeder...</p>
  {:else}
  {#if images.length>0}
    <p style="position:absolute; top:-10px; left: 10px;">Tryk på PDF ell. billede for at åbne</p>
  {/if}
  
    {#each images as image (image.src)}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div class="Preview" on:click={()=>{viewFile(image.src)}}>
        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <div class="img">
          {#if image.src.toLowerCase().endsWith(".pdf")}
            <img draggable="false" style="position:relative; right:1%" src="../pdf-file-placeholder.png" alt={console.log(image.src)} class="billede pdf" />
          {:else if imgfile(image.src)}
          <img style="width: 100px; max-width: 100px" draggable="false" src={image.src} alt={console.log(image.src)} class="billede" />
          {:else}
          <p class="billede" style="position:relative; width: 5vw; margin: 5px; margin-left: -2px; background-color:black; color: white;border-radius: 3px;">{image.src.split('.').pop()}</p>
          <!-- <img  draggable="false" style="position:relative; width: 5vw" src="../text-file.png" alt={console.log(image.src)} class="billede" />-->
          {/if}

          {#await path then result}
          <p style="position:relative; top: 40%; margin: 0px; font-size: smaller">{image.name.slice((result+"/data/"+window.productName+"/").length)}</p>
          {/await}

          

          <button
            id="del"
            style="background-color:white; position: absolute; width: 40px; right: 0px; text-align: left; bottom: 0px; margin: 0px; font-size: smaller"
            on:click={() => {
              deletefile(image.name);
            }}>slet</button
          >
        </div>
      </div>
    {/each}
    {#if images.length===0}
    <div class="center">
      <img src="../not-found.png" alt="" width="200px" style="cursor-events: none" draggable="false">
      <p style="margin:0px">Ingen filer endnu</p>
    </div>
    {/if}
  {/if}
</main>

<style>

  .img{
    display: flex;
    flex-direction: column;
    width: 100%; 
    align-items: center;
    justify-content: center;
  }

  .Preview:has(.pdf):hover{
    
    border-color: red;
    border-width: 5px;
  }

  .Preview:hover{
    border-color: blue;
    border-width: 3px;
  }

  .billede{
    width: auto;
    max-width: 50px;
  }

  .Preview {
    box-sizing: border-box;
    position:relative;
    display: flex;
    text-align: center;
    justify-content: center;
    align-items: center;
    border: 2px solid gray;
    border-radius: 15px;
    overflow:hidden;

    width: 20vw;
    height: 20vw;

    min-height: 125px;
    min-width: 125px;

    max-width: 150px;
    max-height:150px;

    padding: 1%;
  }

  main {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    overflow-x: scroll;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: auto;
    width: auto;
    min-width: 200px;
    min-height: 200px;
    max-width: max(70vh, 800px);
    max-height: min(70vh, 500px);
    margin: 0px;
    padding-top: 1em;
  }

</style>

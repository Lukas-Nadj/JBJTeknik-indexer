<script>
  //TODO: Change .wrap and table to border-box sizing
  import { fade } from "svelte/transition";
  import Header from "./header.svelte";
  import Footer from "./footer.svelte";
  import Fileviewer from "./Components/Fileviewer.svelte";
  import Table from "./Components/Table.svelte";

  let loading = false; // indicates whether we are done loading something?
  let changed = false; //whether there have been changes to the table
  $: favoriteVisible = false; //the favorites bar, changes css

  let vare = { //boilerplate for an item
    Varenummer: 0,
    Produktnavn: "",
    Pris: 0,
  };
  let varer = ["DoNotSave"]; // selve varene
  let data = window.electronApi.loadJSON(); //henter varer.json
  //IT PREVENTS SAVING BEFORE THE DATA HAS BEEN LOADED
  let done = false; // DO NOT CHANGE THIS
  //DON'T YOU DARE
  if (data instanceof Error) {
    console.log(data);
  } else {
    data.then((response) => {
      varer = response;
      varer = varer;
      done = true;
    });
  }
  let visibleVarer = [];
  $: visibleVarer = søgning ? varer.filter((vare) => (vare.Varenummer + "").startsWith(søgning)) : varer;
  $: varer = varer;
  let søgning = "";
  let p = "";
  let images = [];
  $: images = images;

  $: {
    dataChanged(varer);
  }

  window.productName = "";

  function dataChanged(v) {
    if (v) changed = true;
  }

  function addImage(image) {
    images.push(image);
    images = images;
  }

  window.addImage = addImage;

  async function imagegallery(vn) {
    console.log(vn);
    const dialogElement = document.getElementById("billeder");
    window.productName = vn.toString();
    dialogElement.showModal();
    try {
      loading = true;
      if (productName === "") {
        productName = " ";
      }
      const imageNames = await window.electronApi.getProductImages(productName);
      loading = false;
      if (imageNames && imageNames.length > 0) {
        console.log(imageNames);
        images = imageNames.map((imageName) => ({
          name: imageName,
          src: imageName,
        }));
      } else {
        console.warn("No images found for the specified product.");
        images = [];
        loading = false;
      }
    } catch (error) {
      console.error("Error loading images:", error);
      loading = false;
    }
  }

  setInterval(() => {
    if (done && !(varer[0] === "DoNotSave") && changed) {
      //checks if api promise is fulfilled and data is recieved. and then checks that "varer" doesn't still have its default value, preventing overwriting the save on a slow load.
      window.electronApi.SaveToJSON(JSON.stringify(varer));
      changed = false;
    }
  }, 10000);

</script>

<main>
  //style="transition: opacity ease-in-out 0.25s; hide ? 'opacity: 80%;' : 'opacity: 100%'"
  <div class="container">
    <Header bind:søgning bind:varer />
    <div class="table" style="box-sizing: content-box;">
      <div class="wrap" style="height: calc(100% - {favoriteVisible ? '305' : '100'}px)">
        <table style="width:100%; text-align:center; border-collapse:separate !important; margin: 0px" cellspacing="0">
          <thead style="border-radius: 15px">
            <tr style="position: sticky; top: 0px; height: 30px; overflow:hidden; background-color:#2B2F42; color: white;">
              <th style="width: 55px;" />
              <th style="width: 160px;">Varenummer</th>
              <th>Produktnavn</th>
              <th style="width: 160px;">Pris fra 05.22</th>
              <th style="width: 160px;" />
              <th style="width: 35px;">Slet </th>
            </tr>
          </thead>
          <tbody>
            {#each visibleVarer as vare, i}
              <tr transition:fade={{ duration: 80 }} style="height: 35px;" class={i % 2 === 0 ? "odd" : "even"}>
                <td style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;"
                  ><input style="margin: auto;" bind:checked={vare.checked} type="checkbox" name="" id="" /></td
                >
                <td style="color: #373A86; font-weight: 3000;"><input type="text" bind:value={vare.Varenummer} style="all: unset; width: 100%; height: 100%; margin: 0px; background:none" /></td>
                <td style="font-weight: 500; text-align:left"> <input type="text" bind:value={vare.Produktnavn} style="all: unset; width: 100%; height: 100%; margin: 0px; background:none" /></td>
                <td style="text-align:center"><input type="text" bind:value={vare.Pris} style="all: unset; width: 100%; height: 100%; margin: 0px; background:none" /></td>
                <!-- svelte-ignore a11y-invalid-attribute -->
                <td style="text-align: center">
                  <a
                    href="#"
                    on:click={() => {
                      imagegallery(vare.Varenummer);
                    }}
                    >Se Billeder
                  </a></td
                >
                <td style="display: flex; justify-content: center; align-items: center; margin: 0px; height: 30px"
                  ><button
                    on:click={() => {
                      varer.splice(i, 1);
                      varer = varer;
                    }}
                    src="../public/trash_icon.png"
                    style="margin: 0px; box-sizing: border-box ;width: 15px; height: 15px; padding: 3px; padding-bottom:0px;background-color: #751201; border-radius:24px"
                  /></td
                >
              </tr>
            {/each}
          </tbody>
        </table>

        <Table bind:favoriteVisible bind:loading bind:images bind:varer />
      </div>
    </div>

    <Footer bind:varer bind:favoriteVisible />
  </div>
  <dialog class="billeder" id="billeder">
    <div id="clickable-area" class="clickable-area">
      <Fileviewer bind:images bind:loading />
    </div>
  </dialog>
  <script>
    const myDialog = document.getElementById("billeder");
    myDialog.addEventListener("click", () => myDialog.close());
    const myDiv = document.getElementById("clickable-area");
    myDiv.addEventListener("click", (event) => event.stopPropagation());
  </script>
  <script src="./renderer.js"></script>
</main>

<style>

  

  .clickable-area {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;
    min-width: 200px;
    min-height: 200px;
    margin: 0px;
  }

  .wrap {
    box-sizing: content-box;
    display: flex;
    margin-top: 12px !important;
    border-radius: 10px;
    overflow-y: overlay;
    align-items: center;
    flex-direction: column;
    width: 98%;
    margin: 0px;
    padding: 0px;
    transition: height 0.18s ease-in-out;
  }

  .odd {
    color: #555;
    background-color: #f5f5f5;
    transition: background-color linear 0.1s;
  }
  .odd:hover {
    background-color: #e2e2e2;
    transition: background-color linear 0.1s;
  }
  .even {
    color: #555;
    background-color: #fff;
    transition: background-color linear 0.1s;
  }
  .even:hover {
    background-color: #e2e2e2;
    transition: background-color linear 0.1s;
  }

  .billeder {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    max-height: 80vh;
    min-width: 200px;
    min-height: 200px;
    padding: 20px;
    background-color: #f4f4f4;
    border: 2px solid black;
    border-radius: 15px;
  }
  .table {
    box-sizing: border-box;
    grid-row: 2 / 4;
    display: flex;
    align-items: center;
    flex-direction: column;
    overflow: auto;
    color: black;
    background-color: #1e1e1e;
    border-radius: 25px;
    height: calc(100% - 50px);
    overflow: auto;
  }

  table {
    border-spacing: 0;
    border-collapse: collapse;
    border-style: hidden;
    border-radius: 15px;
    height: 35px;
  }

  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  .container {
    position: absolute;
    top: 0px;
    left: 0px;
    display: grid;
    grid-template-rows: 120px 1fr 95px; /* Three rows with equal height */
    height: 100%; /* Fills the entire parent div */
    width: 100%;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<script>

// fjern loading fra den her component, vi bruger det kun til imagegallery


  import {fade, fly} from "svelte/transition";
  //export let favorite = [{ Varenummer: 120757, Produktnavn: "Trin Alu trinplade", Pris: "596,00" }, { Varenummer: 0, Produktnavn: "", Pris: 0 }, {}, {}, {}, {}, {}, {}, {}];
  export let varer;
  export let favoriteVisible;
  export let loading;
  export let images;
  $: hidden = !favoriteVisible;

  $: checkedVarer = varer.filter((vare) => (vare.checked===true));

  async function imagegallery(vn) {
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
</script>

<main style="{favoriteVisible ? 'background-color: #fff;' : 'pointer-events:none'}">
  {#if favoriteVisible}
    <table in:fly={{ y: '100%', duration: 180}} out:fly={{ y: '100%', duration: 180}}  style="width:100%; text-align:center; border-collapse:separate !important; margin: 0px; background-color: #f5f5f5;" cellspacing="0">
        <thead style="border-radius: 15px">
          <tr style="position: sticky; top: 0px; height: 30px; overflow:hidden; background-color:#2B2F42; color: white;">
            <th style="width: 55px;">Gemte</th>
            <th style="width: 160px;"></th>
            <th></th>
            <th style="width: 160px;"></th>
            <th style="width: 160px;" />
            <th style="width: 35px;"></th>
          </tr>
        </thead>
        <tbody>
          {#each checkedVarer as item, i}
            <tr  style="height: 35px;" class={i % 2 === 0 ? "odd" : "even"}>
              <td style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%"><input bind:checked={item.checked} style="margin: auto;" type="checkbox" name="" id=""></td>
              <td style="color: #373A86; font-weight: 3000;"><input type="text" bind:value={item.Varenummer} style="all: unset; width: 100%; height: 100%; margin: 0px; background:none" /></td>
              <td style="font-weight: 500; text-align:left"> <input type="text" bind:value={item.Produktnavn} style="all: unset; width: 100%; height: 100%; margin: 0px; background:none" /></td>
              <td style="text-align:center"><input type="text" bind:value={item.Pris} style="all: unset; width: 100%; height: 100%; margin: 0px; background:none" /></td>
              <!-- svelte-ignore a11y-invalid-attribute -->
              <td style="text-align: center">
                <a
                  href="#"
                  on:click={() => {
                    imagegallery(item.Varenummer);
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
                  style="margin: 0px; box-sizing: border-box ;width: 25px; height: 25px; padding: 3px;background-color: #0F142D; border-radius:24px"
                /></td
              >
            </tr>
          {/each}
        </tbody>

      </table>
      {/if}
</main>

<style>
  main{
    border-radius: 10px;
    position: absolute;
    top: calc(100% - 350px);
    width: 98%;
    height: auto !important;
    min-height: 220px;
    max-height: 220px;
    margin-top: 15px;
    overflow: auto;
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
  
  .table {
    box-sizing: border-box;
    grid-row: 2 / 4;
    display: flex;
    justify-content: center;
    overflow: auto;
    color: black;
    background-color: #1e1e1e;
    border-radius: 25px;
    overflow: auto;
  }

  table {
    border-spacing: 0;
    border-collapse: collapse;
    border-style: hidden;
    border-radius: 15px;
	  height: 35px;
  }
</style>
<script>
    export let varer = [];
    export let favoriteVisible;
    
    let vn;
    let pn; 
    let p;

    let vare = {
		Varenummer: vn,
		Produktnavn: pn,
		Pris: p
	};

    $: vare = vare;

    $: path = undefined;
    window.electronApi.getPath().then((result)=> {path = result; path = path})
</script>

<main>
    <form onsubmit="return false" style="display: flex; flex-direction: row; width: 100%">
    <button type="submit" on:click={() => {let vare = { Varenummer: vn, Produktnavn: pn, Pris: p };varer.push(Object.assign({}, vare)); varer.sort((a, b) => a.Varenummer - b.Varenummer); varer = varer; vn = ""; pn=""; p=""}}>Nyt varenummer</button>
    <div style="color: white; margin: 0px; padding-right: 10px; text-align:left; width: 180px; min-width:95px;">
        <p style=" margin: 0px; width: 100%; min-width: 60px">Varenummer</p>
        <input bind:value={vn} type="text" style="width: 100%; min-width: 60px">
    </div>
    <div style="color: white; margin: 0px; padding-right: 10px; text-align:left; width: 180px; min-width: 85px;">
        <p style=" margin: 0px; width: 100%; min-width: 60px">Beskrivelse</p>
        <input bind:value={pn} type="text" style="width: 100%; min-width: 60px">
    </div>
    <div style="color: white; margin: 0px; padding-right: 10px; text-align:left; margin-right: auto; width: 180px; min-width: 60px;">
        <p style=" margin: 0px; width: 100%; min-width: 60px">Pris</p>
        <input bind:value={p} type="text" style="width: 100%; min-width: 60px">
    </div>
    <div style="justify-self:flex-end; align-self: flex-end; padding-right: 15px">
    <button id="gemte" style="border-radius: 10px; " on:click={()=>{favoriteVisible = !favoriteVisible; favoriteVisible=favoriteVisible}}>
        Gemte varer 
        <i style="margin: auto; margin-left: 10px" class="arrow {favoriteVisible ? "up" : "down"}"></i>
    </button>
    </div>
    </form>
    <p style="color: black;position:absolute; bottom: -35px; left: 5px; text-align: left; padding: 20px">{path}</p>
    
</main>

<style>

  #gemte{
    width: 130px;
  }

    main{
        grid-row: 3 / 4;
        position: absolute;
        box-sizing: border-box;
        background-color: black;
        bottom: 0px;
        left: 0px;
        width: 100vw;
        overflow:hidden;
        max-width: 100vw;
        height: 100px;
        min-height: 95px;
        display: flex;
        align-items: center;
        border-radius: 12px 12px 0px 0px;
        justify-content: left;
        padding-left: 20px;
        box-shadow: 0px 2px 25px rgba(0, 0, 0, 0.7);
    }



    button{
        height: 55px;
        margin-right: 10px;
    }

    .arrow {
  border: solid black;
  border-width: 0 3px 3px 0;
  display: inline-block;
  padding: 3px;
}

.right {
  transform: rotate(-45deg);
  -webkit-transform: rotate(-45deg);
}

.left {
  transform: rotate(135deg);
  -webkit-transform: rotate(135deg);
}

.up {
  transform: rotate(-135deg);
  -webkit-transform: rotate(-135deg);
  transition: all 0.1s linear;
}

.down {
  transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  transition: all 0.1s linear;
}
@media (max-width: 640px) {
  button {
    font-size:x-small;
    width: 60px;
    padding: 2px;
  }

  #gemte{
    width: 110px;
  }
}
</style>
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
    <form onsubmit="return false" style="display: flex; flex-direction: row">
    <button type="submit" on:click={() => {let vare = { Varenummer: vn, Produktnavn: pn, Pris: p };varer.push(Object.assign({}, vare)); varer.sort((a, b) => a.Varenummer - b.Varenummer); varer = varer; vn = ""; pn=""; p=""}}>Nyt varenummer</button>
    <div style="color: white; margin: 0px; padding-right: 10px; text-align:left;">
        <p style=" margin: 0px;">Varenummer</p>
        <input bind:value={vn} type="text">
    </div>
    <div style="color: white; margin: 0px; padding-right: 10px; text-align:left;">
        <p style=" margin: 0px;">Beskrivelse</p>
        <input bind:value={pn} type="text">
    </div>
    <div style="color: white; margin: 0px; padding-right: 10px; text-align:left; margin-right: 140px">
        <p style=" margin: 0px;">Pris</p>
        <input bind:value={p} type="text">
    </div>
    </form>
    <p style="color: black;position:absolute; bottom: -35px; left: 5px; text-align: left; padding: 20px">{path}</p>
    <button style="position: absolute; right: 50px; border-radius: 10px; height: 40px; width: 140px; " on:click={()=>{favoriteVisible = !favoriteVisible; favoriteVisible=favoriteVisible}}>
        Gemte varer 
        <i style="margin: auto; margin-left: 10px" class="arrow {favoriteVisible ? "up" : "down"}"></i>
    </button>
</main>

<style>
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
</style>
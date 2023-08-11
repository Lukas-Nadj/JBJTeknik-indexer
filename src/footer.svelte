<script>
    export let varer;
    
    let vn;
    let pn; 
    let p;

    let vare = {
		Varenummer: vn,
		Produktnavn: pn,
		Pris: p
	};

    $: vare = vare;

    
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
    <div style="color: white; margin: 0px; padding-right: 10px; text-align:left;">
        <p style=" margin: 0px;">Pris</p>
        <input bind:value={p} type="text">
    </div>
    </form>
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
</style>
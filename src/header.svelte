<script>
 export let søgning = undefined;
 export let varer;
</script>

<main>
    <img alt="Logo" src="Logo.png" height=100%>
    <div class="search">
        <p style="margin: 0px">Søg varenummer</p>
        <input type="search" name="" id="" bind:value={søgning} placeholder="f.eks. 120144">
    </div>
        <button class="but" on:click={() => {varer.sort((a, b) => a.Varenummer - b.Varenummer); varer = varer}}><p style="margin: 0px; margin-top: -1px; font-size:small">Sorter</p></button>
    
</main>

<style>
    main{
        box-sizing: border-box;
        grid-row: 1 / 2;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100vw;
        height: 10vh;
        background-color: white;
        min-height: 120px;
        border: 1px solid black;
        border-radius: 0px 0px 12px 12px;
    }

    .search{
        position:absolute;
        text-align: left;
        right: 5px;
        bottom: 1px;
    }

    .but{
        background-color: white;
        position:absolute;
        text-align: center;
        height: 2em;
        left: 15px;
        padding-left: 15px;
        padding-right: 15px;
        bottom: 1px;
        border-radius: 25px;
    }

    @media (max-width: 750px) {
		main {
            box-sizing: border-box;
			align-items: top;
            justify-content: left;
		}

        .but{
            position:absolute;
            left: auto;
            right: 5px !important;
            top: 5px;
        }
	}
</style>
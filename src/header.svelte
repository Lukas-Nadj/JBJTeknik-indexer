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
    <div class="but">
        <button on:click={() => {varer.sort((a, b) => a.Varenummer - b.Varenummer); varer = varer}}>Sorter varenummer</button>
    </div>
    
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
        position:absolute;
        text-align: left;
        left: 5px;
        bottom: 1px;
    }

    @media (max-width: 750px) {
		main {
            box-sizing: border-box;
			align-items: left;
            justify-content: left;
		}

        .but{
            right: 5px !important;
            top: 1px;
        }
	}
</style>
<script>
    
 export let søgning = "";
 export let varer = [];

  let loading = false;

  async function save() {
    loading = true;
    console.log(await window.electronApi.SaveToJSON(JSON.stringify(varer)));
    setTimeout(()=>{loading=false}, 250)
  }

</script>

<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
</head>


<main>
    <img alt="Logo" src="Logo.png" height=100%>
    <div class="search">
        <p style="margin: 0px">Søg varenummer</p>
        <input type="search" name="" id="" bind:value={søgning} placeholder="f.eks. 120144">
    </div>
        <button class="but" on:click={() => {varer.sort((a, b) => a.Varenummer - b.Varenummer); varer = varer}}><p style="margin: 0px; margin-top: -1px; font-size:small">Sorter</p></button>
        <button class="but" on:click={save}  id="save" style="margin: 0px; margin-top: -1px; margin-bottom: 8px; font-size:small; position:absolute; bottom: 1px; height: 2.5em;">
            {#if loading}
            Loading
            <i class="fa fa-refresh fa-spin"></i>
            {:else}
            Gem
            {/if}
        </button>
        
    
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

    #save{
        left: 90px;
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

        #save {
            position:absolute;
            left: auto;
            right: 80px !important;
            top: 6px;
            
        }
	}
</style>
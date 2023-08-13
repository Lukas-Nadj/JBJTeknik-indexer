<script>

	//import { ipc } from './preload.js';   //don't import it directly, it is automatically run before the dom as the "window" object
	import Header from "./header.svelte";
	import Footer from "./footer.svelte";
	import Fileviewer from "./Components/Fileviewer.svelte";
	
	let loading = false;

	let vare = {
		Varenummer: 0,
		Produktnavn: "",
		Pris: 0
	};
	let varer = [{Varenummer: 120757,Produktnavn: "Trin Alu trinplade",Pris: "596,00"}, { Varenummer: 0,Produktnavn: "",Pris: 0}];
	let data = window.electronApi.loadJSON();
	let done = false;
	if(data instanceof Error) {
		console.log(data);
	} else {
		data.then(response => {varer = response; done = true});
	}

	$: visibleVarer = søgning ? varer.filter(vare => vare.Varenummer.toString().startsWith(søgning)) : varer;

	$: varer = varer;
	let søgning = "";
	let p = "";
	let images = [];
	$: images = images;
	window.productName = "";

	function addImage (image){
		images.push(image);
		images = images;	
	};

	window.addImage = addImage;
	
	async function imagegallery(vn) {
		const dialogElement = document.getElementById("billeder");
		window.productName = vn.toString();
		dialogElement.showModal();
		try {
			loading = true;
			const imageNames = await window.electronApi.getProductImages(productName);
			loading = false;
		if (imageNames && imageNames.length > 0) {
			console.log(imageNames);
			images = imageNames.map(imageName => ({
			name: imageName,
			src: imageName
		}));
		} else {
			console.warn('No images found for the specified product.');
			images = [];
			loading = false;
		}
		} catch (error) {
			console.error('Error loading images:', error);
			loading = false;
		}

		
		
  }

	setInterval(() => {
		window.electronApi.SaveToJSON(JSON.stringify(varer));
	}, 5000);
	</script>

<main>
	<div class="container">
	<Header bind:søgning bind:varer></Header>
	<div class="table">
		<table style="width: 98%; text-align:left; padding-top: 12px;">
			<tr style="position: sticky; top: 2px; height: 30px">
				<th style="width: 160px;">Varenummer</th>
				<th>Produktnavn</th>
				<th style="width: 160px;">Pris fra 05.22</th>
				<td style="width: 160px;"></td>
				<td style="width: 35px;">Slet </td>
			</tr>
			{#each visibleVarer as vare, i}
			<tr style="height: 35px; {i% 2 === 0 ? "background-color: #D9D9D9": ""}">
			<td style="color:blue;"><input type="text" bind:value={vare.Varenummer} style="all: unset; width: 100%; height: 100%; margin: 0px; background:none"></td>
			<td style=""> <input type="text" bind:value={vare.Produktnavn} style="all: unset; width: 100%; height: 100%; margin: 0px; background:none"></td>
			<td style="text-align:center"><input type="text" bind:value={vare.Pris} style="all: unset; width: 100%; height: 100%; margin: 0px; background:none"></td>
			<!-- svelte-ignore a11y-invalid-attribute -->
			<td style="text-align: center"> <a href="#" on:click={() => {imagegallery(vare.Varenummer);}}>Se billeder </a></td>
			<td style="display: flex; justify-content: center; align-items: center; margin: 0px; height: 30px"><img alt="stfu" on:click={() => {varer.splice(i, 1); varer = varer}} src="../public/trash_icon.png" width=20px style="padding: 3px;background-color: white; border-radius:24px; border: 1px solid black"></td>
			</tr>
			{/each}
			<div style="height: 80vh"></div>
		</table>
		
	</div>
	<Footer bind:varer ></Footer>
	</div>
	<dialog class="billeder" id="billeder">
		<div id="clickable-area" class="clickable-area">
			<Fileviewer bind:images bind:loading></Fileviewer>
		</div>
	</dialog>
	<script>
		const myDialog = document.getElementById('billeder');
		myDialog.addEventListener('click', () => myDialog.close());
		const myDiv = document.getElementById('clickable-area');
		myDiv.addEventListener('click', (event) => event.stopPropagation());
	</script>
	<script src="./renderer.js"></script>
</main>

<style>
	.clickable-area{
		display: flex;
		flex-direction: row;
		height: 100%;
		width: 100%;
		min-width: 200px;
		min-height: 200px;
		margin: 0px;
	}

	

	.table tr{
		border-radius: 25px;
	}

	.billeder{
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
		background-color:#f4f4f4;
		border: 2px solid black;
		border-radius: 15px;
	}
	.table{
		box-sizing: border-box;
		grid-row: 2 / 4;
		display: flex;
		justify-content: center;
		overflow:auto;
		color: black;
		background-color: #1e1e1e;
		height: calc(100% - 100px);

	
	}
	.table tr{
		background-color: rgb(255, 255, 255);
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

	.container{
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
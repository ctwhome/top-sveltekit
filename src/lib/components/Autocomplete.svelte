<script>
	import { onMount } from 'svelte';
	let searchValue = '';
	let options = [];
	let filteredOptions = [];
	let selectedIndex = -1;
	let showDropdown = false;
	let timeoutId = null;

	function handleInput(event) {
		searchValue = event.target.value;
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			fetchOptions(searchValue);
		}, 500);
	}

	async function fetchOptions(searchTerm) {
		try {
			const response = await fetch(`https://jsonplaceholder.typicode.com/posts?q=${searchTerm}`);
			const data = await response.json();
			options = data.map((post) => post.title);
			filteredOptions = options.filter((option) =>
				option.toLowerCase().includes(searchValue.toLowerCase())
			);
			selectedIndex = -1;
			showDropdown = true;
		} catch (error) {
			console.error(error);
		}
	}

	function handleKeyDown(event) {
		switch (event.key) {
			case 'ArrowDown':
				if (selectedIndex < filteredOptions.length - 1) {
					selectedIndex++;
				}
				break;
			case 'ArrowUp':
				if (selectedIndex > 0) {
					selectedIndex--;
				}
				break;
			case 'Enter':
				if (selectedIndex !== -1) {
					searchValue = filteredOptions[selectedIndex];
				}
				showDropdown = false;
				break;
			case 'Escape':
				showDropdown = false;
				break;
			default:
				break;
		}
	}

	onMount(() => {
		fetchOptions('');
	});
</script>

<div class="input-container">
	<input
		type="text"
		bind:value={searchValue}
		on:input={handleInput}
		on:keydown={handleKeyDown}
		placeholder="Search..."
	/>
	<i class="fa fa-search" />
</div>

{#if showDropdown}
	{#if searchValue}
		<ul>
			{#each filteredOptions as option, i}
				<li class:selected={i === selectedIndex}>{option}</li>
			{/each}
		</ul>
	{/if}
{/if}

<style>
	.input-container {
		position: relative;
	}

	.input-container i {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 18px;
		color: gray;
		pointer-events: none;
	}

	.selected {
		background-color: lightgray;
	}
</style>

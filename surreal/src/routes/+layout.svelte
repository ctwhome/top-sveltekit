<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { initDB } from '$lib/stores/db';

	onMount(async () => {
		await initDB();
	});
</script>

<slot />

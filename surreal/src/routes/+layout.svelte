<script lang="ts">
	import '../app.postcss';
	import { onMount } from 'svelte';
	import { initDB, dbStatus } from '$lib/stores/db';

	onMount(async () => {
		await initDB();
	});
</script>

<slot />

{#if $dbStatus === 'error'}
	<div class="alert alert-error fixed bottom-4 right-4">Failed to connect to database</div>
{/if}

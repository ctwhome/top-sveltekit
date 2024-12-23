<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	onMount(() => {
		// If user is authenticated, redirect to dashboard
		// Otherwise, redirect to login
		if ($page.data.session) {
			goto('/dashboard');
		} else {
			goto('/login');
		}
	});
</script>

<div class="bg-base-200 flex min-h-screen items-center justify-center">
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="loading loading-spinner loading-lg"></div>
			<p class="text-center">Redirecting...</p>
		</div>
	</div>
</div>

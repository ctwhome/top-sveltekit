<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { LogOutIcon } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import TodoList from '$lib/components/TodoList.svelte';

	export let data: any;

	let showToken = false;
	let jwtToken: string | null = null;

	async function handleSignOut() {
		await signOut({ callbackUrl: '/login' });
	}

	$: session = $page.data.session;
	$: user = session?.user;
	$: token = session?.token;

	function formatDate(timestamp: number) {
		return new Date(timestamp * 1000).toLocaleString();
	}

	// Get JWT token from session cookie
	onMount(() => {
		const cookies = document.cookie.split(';');
		const authCookie = cookies.find((cookie) =>
			cookie.trim().startsWith('next-auth.session-token=')
		);
		if (authCookie) {
			jwtToken = authCookie.split('=')[1].trim();
		}
	});
</script>

<div class="min-h-screen bg-base-200 p-8">
	<div class="mx-auto max-w-4xl">
		<div class="mb-8 flex items-center justify-between">
			<h1 class="text-2xl font-bold">Dashboard</h1>
			<button class="btn btn-outline" on:click={handleSignOut}>
				<LogOutIcon class="mr-2 h-5 w-5" />
				Sign Out
			</button>
		</div>

		<div class="space-y-6 rounded-box bg-base-100 p-6 shadow-lg">
			<div>
				<h2 class="mb-4 text-xl font-semibold">Welcome, {user?.name || user?.email || 'User'}!</h2>
				<p>You are now signed in. This is a protected page.</p>
			</div>

			<div class="divider"></div>

			<TodoList />

			<div class="divider"></div>

			<!-- Token Section -->
			<div>
				<div class="mb-4 flex items-center justify-between">
					<h3 class="text-lg font-semibold">JWT Token Information</h3>
					<button class="btn btn-sm" on:click={() => (showToken = !showToken)}>
						{showToken ? 'Hide Token' : 'Show Token'}
					</button>
				</div>

				{#if showToken && token}
					<div class="grid gap-4">
						<div class="stats shadow">
							<div class="stat">
								<div class="stat-title">Token ID (jti)</div>
								<div class="stat-value text-base">{token.jti}</div>
							</div>

							<div class="stat">
								<div class="stat-title">Subject (sub)</div>
								<div class="stat-value text-base">{token.sub}</div>
							</div>
						</div>

						<div class="stats shadow">
							<div class="stat">
								<div class="stat-title">Issued At (iat)</div>
								<div class="stat-value text-base">{token.iat ? formatDate(token.iat) : 'N/A'}</div>
							</div>

							<div class="stat">
								<div class="stat-title">Expires At (exp)</div>
								<div class="stat-value text-base">{token.exp ? formatDate(token.exp) : 'N/A'}</div>
							</div>
						</div>

						{#if jwtToken}
							<div class="mt-2">
								<h4 class="text-md mb-2 font-semibold">Complete JWT Token</h4>
								<div class="mockup-code overflow-x-auto bg-base-300 text-sm">
									<pre data-prefix="~"><code>{jwtToken}</code></pre>
								</div>
							</div>
						{/if}
						<div class="mt-2">
							<h4 class="text-md mb-2 font-semibold">Raw Token Data</h4>
							<div class="mockup-code bg-base-300 text-sm">
								<pre data-prefix="~"><code>{JSON.stringify(token.raw, null, 2)}</code></pre>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

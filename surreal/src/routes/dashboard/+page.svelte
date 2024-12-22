<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { LogOutIcon } from 'lucide-svelte';
	import { page } from '$app/stores';

	export let data: any;

	async function handleSignOut() {
		await signOut({ callbackUrl: '/login' });
	}

	$: session = $page.data.session;
	$: user = session?.user;
	$: token = session?.token;

	function formatDate(timestamp: number) {
		return new Date(timestamp * 1000).toLocaleString();
	}
</script>

<div class="bg-base-200 min-h-screen p-8">
	<div class="mx-auto max-w-4xl">
		<div class="mb-8 flex items-center justify-between">
			<h1 class="text-2xl font-bold">Dashboard</h1>
			<button class="btn btn-outline" on:click={handleSignOut}>
				<LogOutIcon class="mr-2 h-5 w-5" />
				Sign Out
			</button>
		</div>

		<div class="bg-base-100 rounded-box space-y-6 p-6 shadow-lg">
			<div>
				<h2 class="mb-4 text-xl font-semibold">Welcome, {user?.name || user?.email || 'User'}!</h2>
				<p>You are now signed in. This is a protected page.</p>
			</div>

			<div class="divider"></div>

			{#if token}
				<div>
					<h3 class="mb-4 text-lg font-semibold">JWT Token Information</h3>

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
					</div>

					<div class="mt-6">
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

<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { LogOutIcon, PlusIcon, DatabaseIcon, Trash2Icon } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import { dbStatus, create } from '$lib/stores/db';
	import { todos, initTodosLiveQuery, deleteItem, type Item } from '$lib/stores/todos';

	export let data: any;

	let newItemText = '';
	let cleanup: (() => void) | undefined;
	let showToken = false;
	let jwtToken: string | null = null;

	async function handleSignOut() {
		await signOut({ callbackUrl: '/login' });
	}

	async function addItem() {
		if (!newItemText.trim()) return;

		try {
			await create<Item>('items', {
				text: newItemText,
				created_at: new Date().toISOString()
			});
			newItemText = '';
		} catch (error) {
			console.error('Failed to add item:', error);
		}
	}

	$: session = $page.data.session;
	$: user = session?.user;
	$: token = session?.token;

	$: if ($dbStatus === 'connected' && !cleanup) {
		initTodosLiveQuery()
			.then((cleanupFn) => {
				cleanup = cleanupFn;
			})
			.catch((error) => {
				console.error('Failed to initialize live query:', error);
			});
	}

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

	onDestroy(() => {
		if (cleanup) {
			cleanup();
		}
	});
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

			<!-- Todo Section -->
			<div>
				<h3 class="mb-4 text-lg font-semibold">Todo List</h3>

				<div class="mb-4">
					<div class="flex gap-2">
						<input
							type="text"
							bind:value={newItemText}
							placeholder="Enter new item"
							class="input input-bordered flex-1"
							on:keydown={(e) => e.key === 'Enter' && addItem()}
						/>
						<button class="btn btn-primary" on:click={addItem}>
							<PlusIcon class="mr-2 h-4 w-4" />
							Add Item
						</button>
					</div>
				</div>

				<div class="card bg-base-200">
					<div class="card-body">
						{#if $dbStatus === 'connected'}
							<div class="badge badge-success gap-2">
								<DatabaseIcon class="h-4 w-4" />
								Connected
							</div>
						{:else}
							<div class="badge badge-error gap-2">
								<DatabaseIcon class="h-4 w-4" />
								{$dbStatus}
							</div>
						{/if}

						<ul class="mt-4 space-y-2">
							{#each $todos as item (item.id)}
								<li class="bg-base-100 flex items-center justify-between rounded-lg p-3 shadow">
									<span>{item.text}</span>
									<div class="flex items-center gap-4">
										<span class="text-sm opacity-50"
											>{new Date(item.created_at).toLocaleString()}</span
										>
										<button
											class="btn btn-ghost btn-sm text-error"
											on:click={() => deleteItem(item.id)}
											title="Delete item"
										>
											<Trash2Icon class="h-4 w-4" />
										</button>
									</div>
								</li>
							{:else}
								<li class="text-center p-4 text-base-content/50">No items yet</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>

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
								<div class="mockup-code bg-base-300 overflow-x-auto text-sm">
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

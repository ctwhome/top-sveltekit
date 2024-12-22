<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { dbStatus, create } from '$lib/stores/db';
	import { todos, initTodosLiveQuery, deleteItem, type Item } from '$lib/stores/todos';
	import { Plus, Database, Trash2 } from 'lucide-svelte';

	let newItemText = '';
	let cleanup: (() => void) | undefined;

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

	$: if ($dbStatus === 'connected' && !cleanup) {
		initTodosLiveQuery()
			.then((cleanupFn) => {
				cleanup = cleanupFn;
			})
			.catch((error) => {
				console.error('Failed to initialize live query:', error);
			});
	}

	onMount(() => {
		// Component mounted
	});

	onDestroy(() => {
		if (cleanup) {
			cleanup();
		}
	});
</script>

<div class="container mx-auto max-w-2xl p-4">
	<h1 class="mb-4 text-2xl font-bold">SurrealDB Test</h1>

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
				<Plus class="h-4 w-4" />
				Add Item
			</button>
		</div>
	</div>

	<div class="card bg-base-200">
		<div class="card-body">
			{#if $dbStatus === 'connected'}
				<div class="badge badge-success gap-2">
					<Database class="h-4 w-4" />
					Connected
				</div>
			{:else}
				<div class="badge badge-error gap-2">
					<Database class="h-4 w-4" />
					{$dbStatus}
				</div>
			{/if}

			<ul class="mt-4 space-y-2">
				{#each $todos as item (item.id)}
					<li class="flex items-center justify-between rounded-lg bg-base-100 p-3 shadow">
						<span>{item.text}</span>
						<div class="flex items-center gap-4">
							<span class="text-sm opacity-50">{new Date(item.created_at).toLocaleString()}</span>
							<button
								class="btn btn-ghost btn-sm text-error"
								on:click={() => deleteItem(item.id)}
								title="Delete item"
							>
								<Trash2 class="h-4 w-4" />
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

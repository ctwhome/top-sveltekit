<script lang="ts">
	import { PlusIcon, DatabaseIcon, Trash2Icon, GripVerticalIcon } from 'lucide-svelte';
	import { dbStatus } from '$lib/stores/db';
	import {
		todos,
		deleteItem,
		updatePositions,
		loadAllItems,
		addItem,
		type Item,
		initTodosLiveQuery
	} from '$lib/stores/todos';
	import { onDestroy, onMount } from 'svelte';
	import Sortable from 'sortablejs';
	import { RecordId } from 'surrealdb';

	let newItemText = '';
	let cleanup: (() => void) | undefined;
	let todoList: HTMLElement;
	let isUpdatingPositions = false;

	onMount(() => {
		if (todoList) {
			new Sortable(todoList, {
				animation: 150,
				handle: '.handle',
				ghostClass: 'opacity-50',
				onStart: () => {
					console.log('Starting drag with items:', JSON.stringify($todos, null, 2));
				},
				onEnd: async (evt) => {
					const { oldIndex, newIndex } = evt;
					console.log('Drag ended:', { oldIndex, newIndex });

					if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
						console.log('Invalid drag operation - indices:', { oldIndex, newIndex });
						return;
					}

					if (isUpdatingPositions) {
						console.log('Already updating positions, skipping');
						return;
					}

					isUpdatingPositions = true;
					try {
						const items = [...$todos];
						if (!items[oldIndex] || !items[newIndex]) {
							console.error('Invalid indices for current items:', {
								oldIndex,
								newIndex,
								itemCount: items.length
							});
							return;
						}

						console.log('Before reorder:', JSON.stringify(items, null, 2));
						const [removed] = items.splice(oldIndex, 1);
						items.splice(newIndex, 0, removed);
						console.log('After reorder:', JSON.stringify(items, null, 2));

						// Verify all items have IDs before updating
						if (items.every((item) => item.id)) {
							await updatePositions(items);
						} else {
							console.error('Some items are missing IDs:', items);
							await loadAllItems(); // Restore original order
						}
					} catch (error) {
						console.error('Error during reorder:', error);
						await loadAllItems(); // Restore original order
					} finally {
						isUpdatingPositions = false;
					}
				}
			});
		}
	});

	$: if ($dbStatus === 'connected' && !cleanup) {
		initTodosLiveQuery()
			.then((cleanupFn) => {
				cleanup = cleanupFn;
			})
			.catch((error) => {
				console.error('Failed to initialize live query:', error);
			});
	}

	onDestroy(() => {
		if (cleanup) {
			cleanup();
		}
	});

	async function handleAddItem() {
		if (!newItemText.trim()) return;

		try {
			await addItem(newItemText);
			newItemText = '';
		} catch (error) {
			console.error('Failed to add item:', error);
		}
	}
</script>

<div>
	<h3 class="mb-4 text-lg font-semibold">Todo List</h3>

	<div class="mb-4">
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={newItemText}
				placeholder="Enter new item"
				class="input input-bordered flex-1"
				on:keydown={(e) => e.key === 'Enter' && handleAddItem()}
			/>
			<button class="btn btn-primary" on:click={handleAddItem}>
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

			<ul bind:this={todoList} class="mt-4 space-y-2">
				{#each $todos as item (item.id)}
					<li class="flex items-center justify-between rounded-lg bg-base-100 p-3 shadow">
						<div class="flex items-center gap-3">
							<button class="handle btn btn-ghost btn-sm cursor-move" title="Drag to reorder">
								<GripVerticalIcon class="h-4 w-4 opacity-50" />
							</button>
							<span>{item.text}</span>
						</div>
						<div class="flex items-center gap-4">
							<span class="text-sm opacity-50">{new Date(item.created_at).toLocaleString()}</span>
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

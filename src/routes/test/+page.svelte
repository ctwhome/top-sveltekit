<script lang="ts">
	import type { Surreal, Uuid } from 'surrealdb';
	import Counter from './Counter.svelte';
	import { getCounter } from './test.store.svelte';
	import { onMount } from 'svelte';
	import { getDb } from '$lib/db/surreal';
	let count = getCounter();

	onMount(() => {
		console.log('🎹 mounted');
		let queryUuid: Uuid | undefined;
		let db: Surreal | undefined;

		async function setupLiveQuery() {
			try {
				db = await getDb();
				queryUuid = await db.live('test', (action, result) => {
					console.log('🎹 action:', action);
					console.log('🎹 result:', result);
					switch (action) {
						case 'CREATE':
						case 'UPDATE':
						case 'DELETE':
							break;
					}
				});
			} catch (err) {
				console.error(
					'Failed to create live query:',
					err instanceof Error ? err.message : String(err)
				);
			}
		}

		// Set up the live query
		setupLiveQuery();

		// Return a synchronous cleanup function
		return () => {
			if (db && queryUuid) {
				// Kill the live query when component unmounts
				db.kill(queryUuid).catch((err) => {
					console.error('Failed to kill live query:', err);
				});
			}
		};
	});
</script>

<div>
	this will be a test page to update the counter in the store and realtime in the database

	<pre>{JSON.stringify(count, null, 2)}</pre>

	<button class="btn btn-primary" on:click={count.increment}>+</button>
	<button class="btn btn-primary" on:click={count.decrement}>-</button>
</div>

<Counter />

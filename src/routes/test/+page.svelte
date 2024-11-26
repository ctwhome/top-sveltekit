<script lang="ts">
	import type { Surreal, Uuid } from 'surrealdb';
	import Counter from './Counter.svelte';
	import { getCounter } from './test.store.svelte';
	import { onMount } from 'svelte';
	import { getDb } from '$lib/db/surreal';
	let count = getCounter();

	onMount(async () => {
		console.log('🎹 mounted');
		let queryUuid: Uuid | undefined;
		let db: Surreal | undefined;

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

		return async () => {
			if (db && queryUuid) {
				await db.kill(queryUuid);
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

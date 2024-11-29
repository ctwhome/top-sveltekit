<script lang="ts">
	import { onMount } from 'svelte';
	import { SurrealDBClient } from '$lib/db/surrealdb-api';
	import type { User } from '@auth/sveltekit';
	import { page } from '$app/stores';

	let users: User[] = [];

	onMount(async () => {
		try {
			users = await SurrealDBClient.query<User>('SELECT * FROM test');
			console.log('Admin page loaded users:', users);
		} catch (error) {
			console.error('Failed to load users:', error);
		}
	});
</script>

<div>
	session
	<pre>{JSON.stringify($page.data.session, null, 2)}</pre>

	<hr />
	db:
	<pre>{JSON.stringify(users, null, 2)}</pre>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { SurrealDBClient } from '$lib/db/surrealdb-api';
	import type { User } from '@auth/sveltekit';
	import { page } from '$app/stores';

	let users: User[] = [];

	onMount(async () => {
		// Custom query
		// Custom query
		users = await SurrealDBClient.query<User>('SELECT * FROM test');
		console.log('Admin page');
	});
</script>

<div>
	session
	<pre>{JSON.stringify($page.data.session, null, 2)}</pre>

	<hr />
	db:
	<pre>{JSON.stringify(users, null, 2)}</pre>
</div>

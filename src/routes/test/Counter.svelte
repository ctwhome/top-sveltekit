<script>
	import { getCounter } from './test.store.svelte';
	let count = getCounter();
</script>

<div>
	{count.count}
	<button class="btn btn-primary" on:click={count.increment}>+</button>
	<button class="btn btn-primary" on:click={count.decrement}>-</button>
</div>

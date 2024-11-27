<script lang="ts">
	import LoginButton from '$components/ui/Login/LoginButton.svelte';
	import TodoList from '$components/ui/TodoList.svelte';
</script>

<div class="flex flex-col items-center justify-center overflow-auto">
	<div class="mb-16">
		<div class="text-center text-neutral-content">
			<div class="max-w-md">
				<h1 class="mb-5 text-5xl font-bold">Top-sveltekit</h1>
				<p class="mb-5">
					Experience the power of advanced AI assistants in a native-like app interface.
				</p>

				<LoginButton />
			</div>
		</div>
	</div>

	<div class="w-full">
		<TodoList />
	</div>
</div>

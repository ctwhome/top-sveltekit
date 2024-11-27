<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex min-h-[50vh] flex-col items-center justify-center">
	<div class="text-center">
		<h1 class="text-4xl font-bold">Authentication Error</h1>
		<p class="mt-4 text-lg">
			{$page.url.searchParams.get('error') || 'An error occurred during authentication'}
		</p>
		<a href="/login" class="btn btn-primary mt-8">Back to Login</a>
	</div>
</div>

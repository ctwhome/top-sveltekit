<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { AlertCircle, LogIn } from 'lucide-svelte';

	let email = 'test@example.com';
	let password = 'password';
	let loading = false;
	let error: string | null = null;

	async function handleSubmit() {
		loading = true;
		error = null;

		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: true,
				callbackUrl: '/dashboard'
			});

			if (!result) {
				error = 'Invalid email or password';
			}
		} catch (e) {
			error = 'An error occurred during login';
		} finally {
			loading = false;
		}
	}
</script>

<div class="bg-base-200 flex min-h-screen items-center justify-center">
	<div class="card bg-base-100 w-96 shadow-xl">
		<div class="card-body">
			<h2 class="card-title mb-4 justify-center">Login</h2>

			{#if error}
				<div class="alert alert-error mb-4">
					<AlertCircle class="h-6 w-6" />
					<span>{error}</span>
				</div>
			{/if}

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<div class="form-control">
					<label class="label" for="email">
						<span class="label-text">Email</span>
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						class="input input-bordered w-full"
						placeholder="hello@example.com"
						required
					/>
				</div>

				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text">Password</span>
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						class="input input-bordered w-full"
						placeholder="••••••••"
						required
					/>
					<label class="label">
						<span class="label-text-alt">Test credentials: test@example.com / password</span>
					</label>
				</div>

				<button
					type="submit"
					class="btn btn-primary w-full {loading ? 'loading' : ''}"
					disabled={loading}
				>
					{#if !loading}
						<LogIn class="mr-2 h-5 w-5" />
					{/if}
					{loading ? 'Logging in...' : 'Login'}
				</button>
			</form>
		</div>
	</div>
</div>

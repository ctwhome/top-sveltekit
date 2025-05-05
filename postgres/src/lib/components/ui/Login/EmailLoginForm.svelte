<script lang="ts">
	import PhKeyBold from '~icons/ph/key-bold';
	import { signIn } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import { closeLoginModal, getAuthErrorMessage, validateEmail } from './utils';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let isLoading = $state(false);

	async function handleEmailSignIn() {
		error = '';
		isLoading = true;

		// Validate email
		const emailError = validateEmail(email);
		if (emailError) {
			error = emailError;
			isLoading = false;
			return;
		}

		try {
			// Close modal before redirecting
			closeLoginModal();

			const result = await signIn('credentials', {
				email,
				password,
				redirect: true,
				callbackUrl: $page.url.pathname
			});

			if (!result?.ok) {
				error = 'Invalid email or password';
				isLoading = false;
				return;
			}
		} catch (e) {
			error = getAuthErrorMessage(e);
			console.error('Sign in error:', e);
			isLoading = false;
		}
	}
</script>

<form
	class="rounded-box border border-base-300 p-3"
	onsubmit={(e) => {
		e.preventDefault();
		handleEmailSignIn();
	}}
	aria-label="Email login form"
>
	<div class="space-y-3">
		<div class="form-control-float">
			<input
				id="email"
				bind:value={email}
				type="email"
				placeholder=" "
				required
				autocomplete="email"
				disabled={isLoading}
				aria-invalid={error && !validateEmail(email) ? 'true' : undefined}
			/>
			<label for="email">Email</label>
		</div>

		<div class="form-control-float">
			<input
				id="password"
				bind:value={password}
				type="password"
				placeholder=" "
				required
				autocomplete="current-password"
				disabled={isLoading}
			/>
			<label for="password">Password</label>
		</div>

		{#if error}
			<div class="alert alert-error" role="alert">{error}</div>
		{/if}

		<button
			type="submit"
			class="btn btn-outline btn-secondary w-full"
			disabled={isLoading}
			aria-busy={isLoading}
		>
			<PhKeyBold class="size-5" />
			{isLoading ? 'Signing in...' : 'Sign in with Email'}
		</button>
	</div>
</form>

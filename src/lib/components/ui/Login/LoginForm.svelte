<script lang="ts">
	import BiGoogle from '~icons/bi/google';
	import MingcuteMailSendLine from '~icons/mingcute/mail-send-line';
	import PhKeyBold from '~icons/ph/key-bold';
	import { signIn } from '@auth/sveltekit/client';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let openMagicLink = $state(false);
	let openCredentials = $state(true);

	function handleGoogleSignIn() {
		signIn('google', {
			callbackUrl: '/profile'
		});
	}

	function handleMagicLinkSignIn() {
		signIn('resend', {
			email,
			callbackUrl: '/profile'
		});
	}

	async function handleEmailSignIn() {
		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
				callbackUrl: '/profile'
			});

			if (!result?.ok) {
				error = 'Invalid email or password';
			} else {
				error = '';
				const modal = document.getElementById('login-modal') as HTMLInputElement;
				if (modal) modal.checked = false;
				window.location.href = result.url || '/profile';
			}
		} catch (e) {
			error = 'An error occurred during sign in';
			console.error('Sign in error:', e);
		}
	}

	function closeModal() {
		const modal = document.getElementById('login-modal') as HTMLInputElement;
		if (modal) modal.checked = false;
	}
</script>

<div>
	<h1 class="mb-5 text-center text-2xl font-bold">Login Access</h1>
	<div class="flex flex-col gap-4 p-5">
		<!-- Email and Password Login -->
		<form
			class="rounded-box border border-base-300 p-3"
			class:hidden={!openCredentials}
			on:submit|preventDefault={handleEmailSignIn}
		>
			<div class="form-control">
				<input
					bind:value={email}
					type="email"
					placeholder="Enter your email"
					class="input input-bordered"
					required
					autocomplete="email"
				/>
			</div>

			<div class="form-control mt-3">
				<input
					bind:value={password}
					type="password"
					placeholder="Enter your password"
					class="input input-bordered"
					required
					autocomplete="current-password"
				/>
			</div>

			{#if error}
				<div class="mt-2 text-error">{error}</div>
			{/if}

			<button type="submit" class="btn btn-primary mt-3 w-full">
				<PhKeyBold class="size-5" />
				Sign in with Email
			</button>
		</form>

		<div class="divider">OR</div>

		<!-- Google Sign In -->
		<button type="button" class="btn btn-outline" on:click={handleGoogleSignIn}>
			<BiGoogle />
			Sign in with Google
		</button>

		<div class="divider">OR</div>

		<!-- Magic Link Login -->
		<button
			class="btn btn-ghost"
			class:hidden={openMagicLink}
			on:click={() => (openMagicLink = !openMagicLink)}
		>
			<MingcuteMailSendLine class="size-5" />
			Sign in with Magic Link
		</button>
		<form
			class="rounded-box border border-base-300 p-3"
			class:hidden={!openMagicLink}
			on:submit|preventDefault={handleMagicLinkSignIn}
		>
			<div class="form-control">
				<input
					bind:value={email}
					type="email"
					placeholder="Enter your email"
					class="input input-bordered"
					required
					autocomplete="email"
				/>
			</div>

			{#if error}
				<div class="mt-2 text-error">{error}</div>
			{/if}

			<button type="submit" class="btn btn-outline btn-secondary mt-3 w-full">
				<MingcuteMailSendLine class="size-5" />
				Send Magic Link
			</button>
		</form>
	</div>
</div>

<script lang="ts">
	import BiGoogle from '~icons/bi/google';
	import { signIn } from '@auth/sveltekit/client';

	function handleGoogleSignIn() {
		signIn('google', {
			callbackUrl: '/profile'
		});
	}
</script>

<button type="button" class="btn btn-primary" on:click={handleGoogleSignIn}>
	<BiGoogle />
	Access with Google
</button>

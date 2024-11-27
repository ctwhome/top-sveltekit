<script lang="ts">
	import LoginForm from '$lib/components/ui/Login/LoginForm.svelte';
	import RegisterForm from '$lib/components/ui/Login/RegisterForm.svelte';
</script>

<div class="container mx-auto max-w-md p-4">
	<LoginForm>
		<svelte:fragment slot="register-form">
			<RegisterForm />
		</svelte:fragment>
	</LoginForm>
</div>

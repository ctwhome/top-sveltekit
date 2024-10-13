<script lang="ts">
	import '$lib/assets/css/app.css';
	import '$lib/assets/css/code-highlighted-prisma.css';
	import Header from '$components/application/Header.svelte';
	import Analytics from '$components/application/Analytics.svelte';
	import SideMenu from '$components/application/SideMenu.svelte';
	import GlobalToast from '$components/ui/GlobalToast.svelte';
	import { env } from '$env/dynamic/public';
	import FooterMain from '$components/application/footerMain.svelte';
</script>

<Analytics />
<GlobalToast />

<div
	class="grid h-dvh w-dvw grid-rows-[auto_auto_1fr] sm:grid-rows-[auto_1fr] overflow-hidden relative"
>
	<Header />
	<SideMenu />
	<slot>
		<!-- Content here -->
	</slot>
	<FooterMain />
	{#if env.PUBLIC_LOCALHOST}
		<div class="bg-warning text-warning-content fixed bottom-0 left-0 w-full pl-4 text-xs">
			dev database
		</div>
	{/if}
</div>

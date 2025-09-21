<script lang="ts">
	import '../app.css';
	import Header from '$components/ui/Header.svelte';
	import Analytics from '$components/ui/Analytics.svelte';
	import SideMenu from '$components/ui/SideMenu.svelte';
	import GlobalToast from '$components/ui/GlobalToast.svelte';
	import FooterMain from '$components/ui/footerMain.svelte';
	import DevEnvironmentBanner from '$components/ui/DevEnvironmentBanner.svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { dev } from '$app/environment';

	export let data;

	// Initialize Eruda for mobile debugging in development
	onMount(() => {
		if (browser && dev) {
			// Load Eruda only in development mode
			import('eruda').then((module) => {
				const eruda = module.default;

				// Initialize Eruda
				eruda.init();

				// Optional: Auto-show on mobile devices
				if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
					eruda.show();
				}

				console.log('🔧 Eruda mobile debugger initialized');
			}).catch((err) => {
				console.error('Failed to load Eruda:', err);
			});
		}
	});
</script>

<Analytics />
<GlobalToast />

<div
	class="relative grid h-dvh w-dvw grid-rows-[auto_auto_1fr] overflow-hidden sm:grid-rows-[auto_1fr]"
>
	<Header />
	<SideMenu />
	<slot />
	<FooterMain version={data.version} />
	<DevEnvironmentBanner dbInfo={data.dbInfo} />
</div>

<script lang="ts">
	import '../app.css';
	import Header from '$components/ui/Header.svelte';
	import Analytics from '$components/ui/Analytics.svelte';
	import SideMenu from '$components/ui/SideMenu.svelte';
	import GlobalToast from '$components/ui/GlobalToast.svelte';
	import FooterMain from '$components/ui/footerMain.svelte';
	import DevEnvironmentBanner from '$components/ui/DevEnvironmentBanner.svelte';

	export let data;
</script>

<Analytics />
<GlobalToast />

<div
	class="relative grid h-dvh w-dvw grid-rows-[auto_auto_1fr] overflow-hidden sm:grid-rows-[auto_1fr]"
>
	<Header />
	<SideMenu />
	<slot />
	<FooterMain />
	<DevEnvironmentBanner dbInfo={data.dbInfo} />
</div>

<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<div class="w-full overflow-auto">
	<div class="container mx-auto px-4">
		<article
			class="prose prose-lg prose-headings:text-base-content prose-p:text-base-content prose-strong:text-base-content prose-ul:text-base-content prose-li:text-base-content prose-code:text-base-content prose-pre:bg-base-200 max-w-none"
		>
			{@html data.changelogHtml}
		</article>

		<div class="border-base-300 mt-8 border-t pt-8">
			<a href="/" class="btn btn-ghost btn-sm">← Back to Home</a>
		</div>
	</div>
</div>

<script>
	import { onMount } from 'svelte';

	let articles = [];
	onMount(async () => {
		const res = await fetch('https://ctwhomeportfolio.wordpress.com/wp-json/wp/v2/posts');
		articles = await res.json();
	});
</script>

<main>
	<h1>Articles</h1>

	<!-- <pre class="bg-gray-800">{JSON.stringify(articles[0], null, 2)}</pre> -->
	{#each articles as article (article.id)}
		<article>
			<h2>{article.title.rendered}</h2>
			<img src={article.featured_image_src} alt="" />
			<div>
				{@html article.excerpt.rendered}
			</div>
			<a href={article.link} target="_blank">Read more</a>
		</article>
	{/each}
</main>

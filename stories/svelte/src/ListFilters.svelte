<script lang="ts">
	import ListFiltersContent from './views/ListFiltersContent.svelte'
	import StoryShell from './components/StoryShell.svelte'
</script>

<StoryShell
	initialPath="/posts"
	routes={{ '/posts': ListFiltersContent }}
/>

<script lang="ts">
	import ListFiltersWithCustomSyncRouteContent from './views/ListFiltersWithCustomSyncRouteContent.svelte'
	import StoryShell from './components/StoryShell.svelte'
</script>

<StoryShell
	initialPath="/posts"
	routes={{ '/posts': ListFiltersWithCustomSyncRouteContent }}
/>

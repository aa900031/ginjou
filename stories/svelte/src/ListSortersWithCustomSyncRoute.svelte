<script lang="ts">
	import ListSortersWithCustomSyncRouteContent from './views/ListSortersWithCustomSyncRouteContent.svelte'
	import StoryShell from './components/StoryShell.svelte'
</script>

<StoryShell
	initialPath="/posts"
	routes={{ '/posts': ListSortersWithCustomSyncRouteContent }}
/>

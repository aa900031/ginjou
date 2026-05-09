<script lang="ts">
	import ListSortersContent from './views/ListSortersContent.svelte'
	import StoryShell from './components/StoryShell.svelte'
</script>

<StoryShell
	initialPath="/posts"
	routes={{ '/posts': ListSortersContent }}
/>

<script lang="ts">
	import StoryShell from './components/StoryShell.svelte'
	import ListPaginationContent from './views/ListPaginationContent.svelte'
</script>

<StoryShell
	initialPath="/posts"
	routes={{ '/posts': ListPaginationContent }}
/>

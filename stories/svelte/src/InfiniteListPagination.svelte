<script lang="ts">
	import StoryShell from './components/StoryShell.svelte'
	import InfiniteListPaginationContent from './views/InfiniteListPaginationContent.svelte'
</script>

<StoryShell routes={{ '/posts': InfiniteListPaginationContent }} initialPath="/posts" />

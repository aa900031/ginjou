<script lang="ts">
	import StoryShell from './components/StoryShell.svelte'
	import InfiniteListPaginationContent from './views/InfiniteListPaginationContent.svelte'
</script>

<StoryShell withRouter={true} initialPath="/posts">
	<InfiniteListPaginationContent />
</StoryShell>

<script lang="ts">
	import StoryShell from './utils/StoryShell.svelte'
	import InfiniteListPaginationContent from './views/InfiniteListPaginationContent.svelte'
</script>

<StoryShell withRouter={true} initialPath="/posts">
	<InfiniteListPaginationContent />
</StoryShell>

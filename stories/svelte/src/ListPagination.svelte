<script lang="ts">
	import StoryShell from './components/StoryShell.svelte'
	import ListPaginationContent from './views/ListPaginationContent.svelte'
</script>

<StoryShell withRouter={true} initialPath="/posts">
	<ListPaginationContent />
</StoryShell>

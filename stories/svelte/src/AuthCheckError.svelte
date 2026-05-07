<script lang="ts">
	import StoryShell from './utils/StoryShell.svelte'
	import AuthCheckErrorContent from './views/AuthCheckErrorContent.svelte'
</script>

<StoryShell auth={true} withRouter={true} initialPath="/posts">
	<AuthCheckErrorContent />
</StoryShell>

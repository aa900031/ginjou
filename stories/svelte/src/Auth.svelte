<script lang="ts">
	import StoryShell from './utils/StoryShell.svelte'
	import AuthContent from './views/AuthContent.svelte'
</script>

<StoryShell auth={true}>
	<AuthContent />
</StoryShell>

<script lang="ts">
	import StoryShell from './components/StoryShell.svelte'
	import AuthCheckErrorContent from './views/AuthCheckErrorContent.svelte'
</script>

<StoryShell auth={true}>
	<AuthCheckErrorContent/>
</StoryShell>

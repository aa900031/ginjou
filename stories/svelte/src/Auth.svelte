<script lang="ts">
	import StoryShell from './components/StoryShell.svelte'
	import AuthContent from './views/AuthContent.svelte'
</script>

<StoryShell auth={true}>
	<AuthContent />
</StoryShell>

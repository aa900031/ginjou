<script lang="ts">
	import StoryShell from './utils/StoryShell.svelte'
	import AuthIdentityContent from './views/AuthIdentityContent.svelte'
</script>

<StoryShell auth={true}>
	<AuthIdentityContent />
</StoryShell>

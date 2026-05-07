<script lang="ts">
	import StoryShell from './utils/StoryShell.svelte'
	import AuthPermissionsContent from './views/AuthPermissionsContent.svelte'
</script>

<StoryShell auth={true} authz={true}>
	<AuthPermissionsContent />
</StoryShell>
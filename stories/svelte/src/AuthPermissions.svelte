<script lang="ts">
	import StoryShell from './components/StoryShell.svelte'
	import AuthPermissionsContent from './views/AuthPermissionsContent.svelte'
</script>

<StoryShell auth={true} authz={true}>
	<AuthPermissionsContent />
</StoryShell>

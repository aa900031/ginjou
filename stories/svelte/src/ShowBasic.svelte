<script lang="ts">
	import ShowBasicContent from './views/ShowBasicContent.svelte'
	import StoryShell from './components/StoryShell.svelte'
	import { DEFAULT_POST_ID } from './utils/posts'
</script>

<StoryShell withRouter={true} initialPath={`/posts/${DEFAULT_POST_ID}`}>
	<ShowBasicContent />
</StoryShell>

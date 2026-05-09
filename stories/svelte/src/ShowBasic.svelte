<script lang="ts">
	import ShowBasicContent from './views/ShowBasicContent.svelte'
	import StoryShell from './components/StoryShell.svelte'
	import { DEFAULT_POST_ID } from './utils/posts'
</script>

<StoryShell
	routes={{ '/posts/:id': ShowBasicContent }}
	initialPath={`/posts/${DEFAULT_POST_ID}`}
/>

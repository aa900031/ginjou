<script lang="ts">
	import ShowBasicContent from './views/ShowBasicContent.svelte'
	import StoryShell from './components/StoryShell.svelte'
	import { DEFAULT_POST_ID } from '@ginjou/storybook-shared/mock-data'
</script>

<StoryShell
	routes={{ '/posts/:id': ShowBasicContent }}
	initialPath={`/posts/${DEFAULT_POST_ID}`}
/>

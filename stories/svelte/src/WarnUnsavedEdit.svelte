<script lang="ts">
	import { DEFAULT_POST_ID } from '@ginjou/storybook-shared/mock-data'
	import StoryShell from './components/StoryShell.svelte'
	import PostList from './views/PostList.svelte'
	import PostShow from './views/PostShow.svelte'
	import WarnUnsavedEditContent from './views/WarnUnsavedEditContent.svelte'

	const routes = {
		'/posts': PostList,
		'/posts/:id': PostShow,
		'/posts/:id/edit': WarnUnsavedEditContent,
	}
</script>

<StoryShell
	routes={routes}
	initialPath={`/posts/${DEFAULT_POST_ID}/edit`}
/>

<script lang="ts">
	import StoryShell from './components/StoryShell.svelte'
	import PostList from './views/PostList.svelte'
	import PostShow from './views/PostShow.svelte'
	import RouteBlockerContent from './views/RouteBlockerContent.svelte'

	const routes = {
		'/blocker': RouteBlockerContent,
		'/posts': PostList,
		'/posts/:id': PostShow,
	}
</script>

<StoryShell
	routes={routes}
	initialPath="/blocker"
/>

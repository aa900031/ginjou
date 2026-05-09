<script lang="ts">
	import { ResourceActionType } from '@ginjou/core'
	import { wrap } from 'svelte-spa-router/wrap'
	import StoryShell from './components/StoryShell.svelte'
	import FormCreateContent, { type FormRedirect } from './views/FormCreateContent.svelte'
	import PostList from './views/PostList.svelte'
	import PostShow from './views/PostShow.svelte'
	import PostEdit from './views/PostEdit.svelte'

	const { redirect = ResourceActionType.List }: {
		redirect: FormRedirect
	} = $props()

	const routes = $derived.by(() => ({
		'/posts/create': wrap({
			component: FormCreateContent,
			props: {
				redirect,
			},
		}),
		'/posts': PostList,
		'/posts/:id': PostShow,
		'/posts/:id/edit': PostEdit,
	}))
</script>

<StoryShell
	routes={routes}
	initialPath="/posts/create"
/>

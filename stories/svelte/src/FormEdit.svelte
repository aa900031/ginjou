<script lang="ts">
	import type { MutationModeValues } from '@ginjou/core'
	import { MutationMode, ResourceAction } from '@ginjou/core'
	import { wrap } from 'svelte-spa-router/wrap'
	import { DEFAULT_POST_ID } from '@ginjou/storybook-shared/mock-data'
	import StoryShell from './components/StoryShell.svelte'
	import FormEditContent, { type FormRedirect } from './views/FormEditContent.svelte'
	import PostList from './views/PostList.svelte'
	import PostShow from './views/PostShow.svelte'

	const {
		mutationMode = MutationMode.Pessimistic,
		redirect= ResourceAction.Type.Show
	}: {
		mutationMode: MutationModeValues
		redirect: FormRedirect
	} = $props()

	const routes = $derived.by(() => ({
		'/posts': PostList,
		'/posts/:id': PostShow,
		'/posts/:id/edit': wrap({
			component: FormEditContent,
			props: {
				mutationMode,
				redirect,
			}
		}),
	}))
</script>

<StoryShell
	routes={routes}
	initialPath={`/posts/${DEFAULT_POST_ID}/edit`}
/>

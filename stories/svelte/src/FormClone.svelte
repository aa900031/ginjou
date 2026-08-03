<script lang="ts">
	import type { MutationModeValues } from '@ginjou/core'
	import { MutationMode } from '@ginjou/core'
	import { wrap } from 'svelte-spa-router/wrap'
	import { DEFAULT_POST_ID } from '@ginjou/storybook-shared/mock-data'
	import StoryShell from './components/StoryShell.svelte'
	import FormCloneContent, { type FormRedirect } from './views/FormCloneContent.svelte'
	import PostCreate from './views/PostCreate.svelte'
	import PostList from './views/PostList.svelte'
	import PostShow from './views/PostShow.svelte'

	const {
		mutationMode = MutationMode.Pessimistic,
		redirect = 'list',
	}: {
		mutationMode: MutationModeValues
		redirect: FormRedirect
	} = $props()

	const routes = $derived.by(() => ({
		'/posts': PostList,
		'/posts/create': PostCreate,
		'/posts/:id': PostShow,
		'/posts/:id/clone': wrap({
			component: FormCloneContent,
			props: {
				mutationMode,
				redirect,
			},
		}),
	}))
</script>

<StoryShell
	{routes}
	initialPath={`/posts/${DEFAULT_POST_ID}/clone`}
/>

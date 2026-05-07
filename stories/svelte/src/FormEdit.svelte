<script lang="ts">
	import type { MutationModeValues } from '@ginjou/core'
	import { MutationMode, ResourceActionType } from '@ginjou/core'
	import StoryShell from './utils/StoryShell.svelte'
	import { DEFAULT_POST_ID } from './utils/posts'
	import FormEditContent, { type FormRedirect } from './views/FormEditContent.svelte'

	export let mutationMode: MutationModeValues = MutationMode.Pessimistic
	export let redirect: FormRedirect = ResourceActionType.Show
</script>

<StoryShell withRouter={true} initialPath={`/posts/${DEFAULT_POST_ID}/edit`}>
	<FormEditContent {mutationMode} {redirect} />
</StoryShell>

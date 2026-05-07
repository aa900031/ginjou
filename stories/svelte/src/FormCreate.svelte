<script lang="ts">
	import { ResourceActionType } from '@ginjou/core'
	import StoryShell from './utils/StoryShell.svelte'
	import FormCreateContent, { type FormRedirect } from './views/FormCreateContent.svelte'

	export let redirect: FormRedirect = ResourceActionType.List
</script>

<StoryShell withRouter={true} initialPath="/posts/create">
	<FormCreateContent {redirect} />
</StoryShell>
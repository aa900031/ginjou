<script lang="ts">
	import type { Post } from '@ginjou/storybook-shared/mock-data'
	import { MOCK_POST_IDS } from '@ginjou/storybook-shared/mock-data'
	import StoryShell from './components/StoryShell.svelte'
	import GetManyByOneContent from './views/GetManyByOneContent.svelte'

	const { ids = [MOCK_POST_IDS.at(1)!, MOCK_POST_IDS.at(3)!, MOCK_POST_IDS.at(5)!] }: {
		ids?: Post['id'][]
	} = $props()
</script>

<StoryShell>
	<GetManyByOneContent {ids} />
</StoryShell>

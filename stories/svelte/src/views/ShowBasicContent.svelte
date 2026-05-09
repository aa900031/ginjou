<script lang="ts">
	import { useShow } from '@ginjou/svelte'
	import type { Post } from '../api/posts'
	import Card from '../components/Card.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Stack from '../components/Stack.svelte'
	import LocaleBadge from '../components/LocaleBadge.svelte'

	const show = useShow<Post>()
</script>

<Stack>
	<LocaleBadge />

	<PageTitle>Posts Details</PageTitle>

	<Card>
		<p>id: {show.record?.id}</p>
		<p>title: {show.record?.title}</p>
		<p>status: {show.record?.status}</p>
	</Card>
</Stack>

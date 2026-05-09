<script lang="ts">
	import { useLocation, useShow } from '@ginjou/svelte'
	import type { Post } from '../api/posts'
	import Card from '../components/Card.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Stack from '../components/Stack.svelte'
	import UrlBadge from '../components/UrlBadge.svelte'
	import { formatLocation } from '../utils/location'

	const show = useShow<Post>()
	const location = useLocation()
</script>

<Stack>
	<UrlBadge url={formatLocation(location.value)} />

	<PageTitle>Posts Details</PageTitle>

	{#if show.isFetching}
		<Card>Loading...</Card>
	{:else}
		<Card>
			<p>id: {show.record?.id}</p>
			<p>title: {show.record?.title}</p>
			<p>status: {show.record?.status}</p>
		</Card>
	{/if}
</Stack>

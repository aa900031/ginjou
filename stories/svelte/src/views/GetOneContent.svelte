<script lang="ts">
	import { useGetOne } from '@ginjou/svelte'
	import type { Post } from '../api/posts'
	import Card from '../components/Card.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Stack from '../components/Stack.svelte'
	import { DEFAULT_POST_ID } from '../utils/posts'

	const query = useGetOne<Post>({
		id: DEFAULT_POST_ID,
		resource: 'posts',
	})
</script>

<Stack>
	<PageTitle>useGetOne</PageTitle>

	{#if query.isFetching}
		<Card>Loading...</Card>
	{:else if query.record}
		<Card>
			<p>id: {query.record.id}</p>
			<p>title: {query.record.title}</p>
			<p>status: {query.record.status}</p>
		</Card>
	{:else}
		<Card>Not found</Card>
	{/if}
</Stack>

<script lang="ts">
	import { useGetManyByOne } from '@ginjou/svelte'
	import type { Post } from '@ginjou/storybook-shared/mock-data'
	import Card from '../components/Card.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Stack from '../components/Stack.svelte'
	import Table from '../components/Table.svelte'
	import Td from '../components/Td.svelte'
	import Th from '../components/Th.svelte'

	const { ids }: {
		ids: Post['id'][]
	} = $props()

	const query = useGetManyByOne<Post>(() => ({
		ids,
		resource: 'posts',
	}))
</script>

<Stack>
	<PageTitle>useGetManyByOne</PageTitle>

	{#if query.isFetching}
		<Card>Loading...</Card>
	{:else if !query.records?.length}
		<Card>No records</Card>
	{:else}
		<Table>
			<thead>
				<tr>
					<Th>ID</Th>
					<Th>Title</Th>
					<Th>Status</Th>
				</tr>
			</thead>
			<tbody>
				{#each query.records ?? [] as record}
					<tr>
						<Td>{record.id}</Td>
						<Td>{record.title}</Td>
						<Td>{record.status}</Td>
					</tr>
				{/each}
			</tbody>
		</Table>
	{/if}
</Stack>

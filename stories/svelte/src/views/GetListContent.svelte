<script lang="ts">
	import { useGetList } from '@ginjou/svelte'
	import type { Post } from '../api/posts'
	import Card from '../components/Card.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Stack from '../components/Stack.svelte'
	import Table from '../components/Table.svelte'
	import Td from '../components/Td.svelte'
	import Th from '../components/Th.svelte'

	const query = useGetList<Post>({
		resource: 'posts',
	})
</script>

<Stack>
	<PageTitle>useGetList</PageTitle>

	{#if query.isFetching}
		<Card>Loading...</Card>
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

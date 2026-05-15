<script lang="ts">
	import { useDeleteOne, useList } from '@ginjou/svelte'
	import type { Post } from '@ginjou/storybook-shared/mock-data'
	import Button from '../components/Button.svelte'
	import Card from '../components/Card.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Stack from '../components/Stack.svelte'
	import Table from '../components/Table.svelte'
	import Td from '../components/Td.svelte'
	import Th from '../components/Th.svelte'

	const list = useList<Post>({
		resource: 'posts',
		syncRoute: false,
	})
	const mutation = useDeleteOne<Post>()

	async function handleDelete(record: Post): Promise<void> {
		await mutation.mutateAsync({
			id: record.id,
			resource: 'posts',
		})
	}
</script>

<Stack>
	<PageTitle>useDeleteOne</PageTitle>

	<Table>
		<thead>
			<tr>
				<Th>ID</Th>
				<Th>Title</Th>
				<Th>Status</Th>
				<Th>Actions</Th>
			</tr>
		</thead>
		<tbody>
			{#each list.records ?? [] as record}
				<tr>
					<Td>{record.id}</Td>
					<Td>{record.title}</Td>
					<Td>{record.status}</Td>
					<Td>
						<Button onclick={() => handleDelete(record)} disabled={mutation.isPending}>
							Delete
						</Button>
					</Td>
				</tr>
			{/each}
		</tbody>
	</Table>
</Stack>

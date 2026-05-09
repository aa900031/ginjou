<script lang="ts">
	import { useDeleteMany, useList } from '@ginjou/svelte'
	import type { Post } from '../api/posts'
	import Button from '../components/Button.svelte'
	import Card from '../components/Card.svelte'
	import InlineActions from '../components/InlineActions.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Stack from '../components/Stack.svelte'
	import Table from '../components/Table.svelte'
	import Td from '../components/Td.svelte'
	import Th from '../components/Th.svelte'

	const list = useList<Post>({
		resource: 'posts',
		syncRoute: false,
	})
	const mutation = useDeleteMany<Post>()

	let selectedIds = $state<string[]>([])

	async function handleDeleteClick(): Promise<void> {
		const ids = selectedIds.slice()
		selectedIds = []

		await mutation.mutateAsync({
			ids,
			resource: 'posts',
		})
	}

	function toggleId(id: string, checked: boolean): void {
		if (checked)
			selectedIds = [...selectedIds, id]
		else
			selectedIds = selectedIds.filter(v => v !== id)
	}
</script>

<Stack>
	<PageTitle>useDeleteMany</PageTitle>

	<InlineActions>
		<Button disabled={selectedIds.length === 0 || mutation.isPending} onclick={handleDeleteClick}>
			{mutation.isPending ? 'Deleting...' : 'Delete Selected'}
		</Button>
	</InlineActions>

	<Table>
		<thead>
			<tr>
				<Th>V</Th>
				<Th>ID</Th>
				<Th>Title</Th>
				<Th>Status</Th>
			</tr>
		</thead>
		<tbody>
			{#each list.records ?? [] as record}
				<tr>
					<Td>
						<input
							type="checkbox"
							checked={selectedIds.includes(record.id as string)}
							onchange={(e) => toggleId(record.id as string, e.currentTarget.checked)}
						/>
					</Td>
					<Td>{record.id}</Td>
					<Td>{record.title}</Td>
					<Td>{record.status}</Td>
				</tr>
			{/each}
		</tbody>
	</Table>
</Stack>

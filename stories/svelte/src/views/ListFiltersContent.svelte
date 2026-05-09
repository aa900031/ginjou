<script lang="ts">
	import { useList } from '@ginjou/svelte'
	import type { Post } from '../api/posts'
	import { FilterOperator } from '@ginjou/core'
	import Card from '../components/Card.svelte'
	import FieldLabel from '../components/FieldLabel.svelte'
	import InlineActions from '../components/InlineActions.svelte'
	import Input from '../components/Input.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Stack from '../components/Stack.svelte'
	import Table from '../components/Table.svelte'
	import Td from '../components/Td.svelte'
	import Th from '../components/Th.svelte'
	import LocaleBadge from '../components/LocaleBadge.svelte'

	const list = useList<Post>({
		syncRoute: true,
	})

	let formData = $state({ title: '', id: '' })

	$effect(() => {
		list.filters = [
			formData.title
				? {
						field: 'title',
						operator: FilterOperator.contains,
						value: formData.title,
					}
				: undefined as any,
			formData.id
				? {
						field: 'id',
						operator: FilterOperator.eq,
						value: formData.id,
					}
				: undefined as any,
		].filter(Boolean)
	})
</script>

<Stack>
	<LocaleBadge />

	<PageTitle>Posts</PageTitle>

	<InlineActions>
		<FieldLabel>
			<span>Title</span>
			<Input bind:value={formData.title} type="text" placeholder="Search by Title" />
		</FieldLabel>
		<FieldLabel>
			<span>ID</span>
			<Input bind:value={formData.id} type="text" placeholder="Search by ID" />
		</FieldLabel>
	</InlineActions>

	{#if list.isFetching}
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
				{#each list.records ?? [] as record}
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

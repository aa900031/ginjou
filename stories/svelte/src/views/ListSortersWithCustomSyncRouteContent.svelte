<script lang="ts">
	import { useList } from '@ginjou/svelte'
	import type { Post } from '../api/posts'
	import Button from '../components/Button.svelte'
	import Card from '../components/Card.svelte'
	import InlineActions from '../components/InlineActions.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Stack from '../components/Stack.svelte'
	import Table from '../components/Table.svelte'
	import Td from '../components/Td.svelte'
	import Th from '../components/Th.svelte'
	import LocaleBadge from '../components/LocaleBadge.svelte'

	const list = useList<Post>({
		syncRoute: {
			currentPage: false,
			perPage: false,
			filters: false,
			sorters: {
				field: 'sorter',
				parse: (str) => {
					const raw = JSON.parse(str) as [string, string][]
					return raw.map(item => ({
						field: item[0],
						order: item[1] as any,
					}))
				},
				stringify: (value) => {
					return JSON.stringify(value.map(item => [item.field, item.order]))
				},
			},
		},
	})

	let titleAsc = $state<boolean | undefined>(undefined)
	let idAsc = $state<boolean | undefined>(undefined)

	$effect(() => {
		list.sorters = [
			titleAsc != null ? { field: 'title', order: titleAsc ? 'asc' : 'desc' } : undefined as any,
			idAsc != null ? { field: 'id', order: idAsc ? 'asc' : 'desc' } : undefined as any,
		].filter(Boolean)
	})

	function toggleTitle() {
		titleAsc = !titleAsc
	}

	function toggleId() {
		idAsc = !idAsc
	}
</script>

<Stack>
	<LocaleBadge />

	<PageTitle>Posts</PageTitle>

	<InlineActions>
		<Button onclick={toggleTitle}>
			{titleAsc ? 'Sort Title by DESC' : 'Sort Title by ASC'}
		</Button>
		<Button onclick={toggleId}>
			{idAsc ? 'Sort ID by DESC' : 'Sort ID by ASC'}
		</Button>
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

<script lang="ts">
	import { useInfiniteList } from '@ginjou/svelte'
	import type { Post } from '../api/posts'
	import Button from '../components/Button.svelte'
	import Card from '../components/Card.svelte'
	import FieldLabel from '../components/FieldLabel.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Select from '../components/Select.svelte'
	import Stack from '../components/Stack.svelte'
	import Table from '../components/Table.svelte'
	import Td from '../components/Td.svelte'
	import Th from '../components/Th.svelte'
	import InlineActions from '../components/InlineActions.svelte'
	import LocaleBadge from '../components/LocaleBadge.svelte';

	const list = useInfiniteList<Post>({
		resource: 'posts',
		syncRoute: true,
	})

	async function handleMoreClick(): Promise<void> {
		await list.fetchNextPage()
	}
</script>

<Stack>
	<LocaleBadge />

	<PageTitle>useInfiniteList</PageTitle>

	{#if list.isFetching && (list.records == null || list.records.length === 0)}
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
				{#each list.records ?? [] as page}
					{#each page as record}
						<tr>
							<Td>{record.id}</Td>
							<Td>{record.title}</Td>
							<Td>{record.status}</Td>
						</tr>
					{/each}
				{/each}
				<tr>
					<Td colspan={3}>
						<Button type="button" onclick={handleMoreClick} disabled={!list.hasNextPage || list.isFetchingNextPage}>
							{list.isFetchingNextPage ? 'Loading...' : 'More'}
						</Button>
					</Td>
				</tr>
			</tbody>
		</Table>

		<InlineActions>
			<FieldLabel>
				<span>Per page</span>
				<Select bind:value={list.perPage}>
					{#each [10, 20, 30, 40] as count}
						<option value={count}>{count}</option>
					{/each}
				</Select>
			</FieldLabel>
		</InlineActions>
	{/if}
</Stack>

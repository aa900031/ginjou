<script lang="ts">
	import { useList } from '@ginjou/svelte'
	import type { Post } from '../api/posts'
	import Button from '../components/Button.svelte'
	import Card from '../components/Card.svelte'
	import FieldLabel from '../components/FieldLabel.svelte'
	import InlineActions from '../components/InlineActions.svelte'
	import Input from '../components/Input.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Select from '../components/Select.svelte'
	import Stack from '../components/Stack.svelte'
	import Table from '../components/Table.svelte'
	import Td from '../components/Td.svelte'
	import Th from '../components/Th.svelte'
	import LocaleBadge from '../components/LocaleBadge.svelte'

	const list = useList<Post>({
		syncRoute: true,
	})

	const hasPrev = $derived(list.currentPage > 1)
	const hasNext = $derived(list.pageCount == null ? false : list.currentPage < list.pageCount)

	function handleFirstPage() {
		list.currentPage = 1
	}
	function handlePrevPage() {
		list.currentPage = list.currentPage - 1
	}
	function handleNextPage() {
		list.currentPage = list.currentPage + 1
	}
	function handleLastPage() {
		list.currentPage = list.pageCount ?? list.currentPage
	}
</script>

<Stack>
	<LocaleBadge />

	<PageTitle>Posts</PageTitle>

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

		<Card>
			<Stack>
				<InlineActions>
					<Button onclick={handleFirstPage} disabled={!hasPrev}>First</Button>
					<Button onclick={handlePrevPage} disabled={!hasPrev}>Previous</Button>
					<Button onclick={handleNextPage} disabled={!hasNext}>Next</Button>
					<Button onclick={handleLastPage} disabled={!hasNext}>Last</Button>
				</InlineActions>

				<span>Page {list.currentPage} / {list.pageCount ?? 1}</span>

				<FieldLabel>
					<span>Go to page</span>
					<Input type="number" min={1} max={list.pageCount ?? 1} bind:value={list.currentPage} />
				</FieldLabel>

				<FieldLabel>
					<span>Per page</span>
					<Select bind:value={list.perPage}>
						{#each [10, 20, 30, 40] as count}
							<option value={count}>{count}</option>
						{/each}
					</Select>
				</FieldLabel>
			</Stack>
		</Card>
	{/if}
</Stack>

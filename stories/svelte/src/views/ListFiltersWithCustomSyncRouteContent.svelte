<script lang="ts">
	import { useList } from '@ginjou/svelte'
	import type { Filter } from '@ginjou/core'
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
		syncRoute: {
			currentPage: false,
			perPage: false,
			sorters: false,
			filters: {
				field: 'filter',
				parse: (str) => {
					const raw = JSON.parse(str) as ([string, string, any] | [string, any[]])[]
					const resolve = (item: [string, string, any] | [string, any[]]): Filter => {
						if (item.length === 2) {
							return {
								operator: item[0] as any,
								value: (item[1] as any[]).map((sub: any) => resolve(sub)),
							}
						}
						return {
							field: item[0],
							operator: item[1] as any,
							value: item[2],
						}
					}
					return raw.map(item => resolve(item))
				},
				stringify: (value) => {
					const resolve = (item: Filter) => {
						if ('field' in item) {
							return [item.field, item.operator, item.value]
						}
						return [item.operator, item.value]
					}
					return JSON.stringify(value.map(item => resolve(item)))
				},
			},
		},
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
</Stack>

<script lang="ts">
	import { useInfiniteList, useLocation } from '@ginjou/svelte'
	import type { Post } from '../api/posts'
	import { formatLocation } from '../utils/mock-router'

	const list = useInfiniteList<Post>({
		resource: 'posts',
		syncRoute: true,
	})
	const location = useLocation()
	const loadedCount = $derived.by(() => list.records?.reduce((count, page) => count + page.length, 0) ?? 0)

	async function handleMoreClick(): Promise<void> {
		await list.fetchNextPage()
	}
</script>

<div class="stack">
	<code>URL: {formatLocation(location.value)}</code>

	<h1>useInfiniteList</h1>

	{#if list.isFetching && (list.records == null || list.records.length === 0)}
		<div class="card">Loading...</div>
	{:else}
		<table>
			<thead>
				<tr>
					<th>ID</th>
					<th>Title</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				{#each list.records ?? [] as page}
					{#each page as record}
						<tr>
							<td>{record.id}</td>
							<td>{record.title}</td>
							<td>{record.status}</td>
						</tr>
					{/each}
				{/each}
				<tr>
					<td colspan="3">
						<button type="button" onclick={handleMoreClick} disabled={!list.hasNextPage || list.isFetchingNextPage}>
							{list.isFetchingNextPage ? 'Loading...' : 'More'}
						</button>
					</td>
				</tr>
			</tbody>
		</table>

		<div class="card stack">
			<p>Loaded: {loadedCount} / {list.total ?? loadedCount}</p>

			<label>
				<span>Per page</span>
				<select
					value={list.perPage}
					onchange={(event) => {
						list.perPage = Number((event.currentTarget as HTMLSelectElement).value)
					}}
				>
					{#each [10, 20, 30, 40] as count}
						<option value={count}>{count}</option>
					{/each}
				</select>
			</label>
		</div>
	{/if}
</div>

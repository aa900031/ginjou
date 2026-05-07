<script lang="ts">
	import { useList, useLocation } from '@ginjou/svelte'
	import type { Post } from '../api/posts'
	import { formatLocation } from '../utils/mock-router'

	const list = useList<Post>({
		syncRoute: true,
	})
	const location = useLocation()

	function hasPrev(): boolean {
		return list.currentPage > 1
	}

	function hasNext(): boolean {
		return list.pageCount == null ? false : list.currentPage < list.pageCount
	}
</script>

<div class="stack">
	<code>URL: {formatLocation(location.value)}</code>

	<h1>Posts</h1>

	{#if list.isFetching}
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
				{#each list.records ?? [] as record}
					<tr>
						<td>{record.id}</td>
						<td>{record.title}</td>
						<td>{record.status}</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<div class="card stack">
			<div class="inline-actions">
				<button onclick={() => { list.currentPage = 1 }} disabled={!hasPrev()}>
					First
				</button>
				<button onclick={() => { list.currentPage = list.currentPage - 1 }} disabled={!hasPrev()}>
					Previous
				</button>
				<button onclick={() => { list.currentPage = list.currentPage + 1 }} disabled={!hasNext()}>
					Next
				</button>
				<button onclick={() => { list.currentPage = list.pageCount ?? list.currentPage }} disabled={!hasNext()}>
					Last
				</button>
			</div>

			<div class="meta-row">
				<span>Page {list.currentPage} / {list.pageCount ?? 1}</span>
			</div>

			<label>
				<span>Go to page</span>
				<input
					type="number"
					min="1"
					max={list.pageCount ?? 1}
					value={list.currentPage}
					oninput={(event) => {
						const value = Number((event.currentTarget as HTMLInputElement).value)
						if (!Number.isNaN(value) && value >= 1)
							list.currentPage = value
					}}
				/>
			</label>

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

<script lang="ts">
	import { useDeleteOne, useList } from '@ginjou/svelte'
	import type { Post } from '../api/posts'

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

<div class="stack">
	<h1>useDeleteOne</h1>

	{#if list.isFetching}
		<div class="card">Loading...</div>
	{:else}
		<table>
			<thead>
				<tr>
					<th>ID</th>
					<th>Title</th>
					<th>Status</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each list.records ?? [] as record}
					<tr>
						<td>{record.id}</td>
						<td>{record.title}</td>
						<td>{record.status}</td>
						<td>
							<button onclick={() => handleDelete(record)} disabled={mutation.isPending}>
								Delete
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<script lang="ts">
	import { useGetList } from '@ginjou/svelte'
	import type { Post } from '../api/posts'

	const query = useGetList<Post>({
		resource: 'posts',
	})
    $effect(() => {
        console.log(query);

        console.log(query.records);
    })
</script>

<div class="stack">
	<h1>useGetList</h1>

	{#if query.isFetching}
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
				{#each query.records ?? [] as record}
					<tr>
						<td>{record.id}</td>
						<td>{record.title}</td>
						<td>{record.status}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

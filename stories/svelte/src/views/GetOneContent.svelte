<script lang="ts">
	import { useGetOne } from '@ginjou/svelte'
	import type { Post } from '../api/posts'
	import { DEFAULT_POST_ID } from '../utils/posts'

	const query = useGetOne<Post>({
		id: DEFAULT_POST_ID,
		resource: 'posts',
	})
</script>

<div class="stack">
	<h1>useGetOne</h1>

	{#if query.isFetching}
		<div class="card">Loading...</div>
	{:else if query.record}
		<div class="card">
			<p>id: {query.record.id}</p>
			<p>title: {query.record.title}</p>
			<p>status: {query.record.status}</p>
		</div>
	{:else}
		<div class="card">Not found</div>
	{/if}
</div>

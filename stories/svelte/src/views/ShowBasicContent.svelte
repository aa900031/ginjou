<script lang="ts">
	import { useLocation, useShow } from '@ginjou/svelte'
	import type { Post } from '../api/posts'
	import { formatLocation } from '../utils/mock-router'

	const show = useShow<Post>()
	const location = useLocation()
</script>

<div class="stack">
	<code>URL: {formatLocation(location.value)}</code>

	<h1>Posts Details</h1>

	{#if show.isFetching}
		<div class="card">Loading...</div>
	{:else}
		<div class="card">
			<p>id: {show.record?.id}</p>
			<p>title: {show.record?.title}</p>
			<p>status: {show.record?.status}</p>
		</div>
	{/if}
</div>

<script lang="ts">
	import { useSelect } from '@ginjou/svelte'
	import type { Post } from '../api/posts'

	let value = $state<string | undefined>()

	const select = useSelect<Post>(() => ({
		resource: 'posts',
		value,
	}))
</script>

<div class="stack">
	<h1>useSelect</h1>

	<label>
		<span>Search</span>
		<input
			placeholder="Keyword for option list"
			value={select.search ?? ''}
			oninput={(event) => {
				select.search = (event.currentTarget as HTMLInputElement).value || undefined
			}}
		/>
	</label>

	<label>
		<span>Post</span>
		<select
			value={value ?? ''}
			onchange={(event) => {
				const nextValue = (event.currentTarget as HTMLSelectElement).value
				value = nextValue || undefined
			}}
		>
			<option value="">Select a post</option>
			{#each select.options ?? [] as option}
				<option value={`${option.value}`}>{option.label}</option>
			{/each}
		</select>
	</label>

	<div class="card">Selected value: {value ?? 'None'}</div>
</div>

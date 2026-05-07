<script lang="ts">
	import { useCreateOne } from '@ginjou/svelte'
	import type { Post, PostRawFormData } from '../api/posts'

	const mutation = useCreateOne<Post, PostRawFormData>({
		resource: 'posts',
	})

	let formData = $state<PostRawFormData>({
		title: '',
		status: 'draft',
	})
	let result = $state<Post | undefined>()

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault()

		await mutation.mutateAsync({
			params: {
				...formData,
			},
		}, {
			onSuccess: (data) => {
				result = data.data
			},
		})
	}
</script>

<div class="stack">
	<h1>useCreateOne</h1>

	<form onsubmit={handleSubmit}>
		<label>
			<span>Title</span>
			<input
				value={formData.title ?? ''}
				oninput={(event) => {
					formData.title = (event.currentTarget as HTMLInputElement).value
				}}
			/>
		</label>

		<label>
			<span>Status</span>
			<select
				value={formData.status ?? 'draft'}
				onchange={(event) => {
					formData.status = (event.currentTarget as HTMLSelectElement).value
				}}
			>
				<option value="draft">draft</option>
				<option value="published">published</option>
				<option value="rejected">rejected</option>
			</select>
		</label>

		<button type="submit" disabled={mutation.isPending}>
			{mutation.isPending ? 'Submitting...' : 'Submit'}
		</button>
	</form>

	<div class="stack">
		<h1>Result</h1>
		<pre>{JSON.stringify(result ?? null, null, 2)}</pre>
	</div>
</div>

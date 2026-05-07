<script lang="ts">
	import { useUpdateOne } from '@ginjou/svelte'
	import type { Post, PostFormData, PostRawFormData } from '../api/posts'
	import { DEFAULT_POST_ID } from '../utils/posts'

	const mutation = useUpdateOne<Post, PostFormData>({
		resource: 'posts',
		id: DEFAULT_POST_ID,
	})

	let formData = $state<PostRawFormData>({
		title: 'Next title',
		status: 'published',
	})
	let result = $state<Post | undefined>()

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault()

		await mutation.mutateAsync({
			params: {
				title: formData.title ?? 'Updated title',
				status: formData.status ?? 'draft',
			},
		}, {
			onSuccess: (data) => {
				result = data.data
			},
		})
	}
</script>

<div class="stack">
	<h1>useUpdateOne</h1>

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
				value={formData.status ?? 'published'}
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

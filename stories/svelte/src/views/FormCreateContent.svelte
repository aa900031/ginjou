<script lang="ts" module>
	import { ResourceActionType } from '@ginjou/core'

	export type FormRedirect = false | typeof ResourceActionType.List | typeof ResourceActionType.Create | typeof ResourceActionType.Show | typeof ResourceActionType.Edit
</script>

<script lang="ts">
	import { useCreate, useLocation } from '@ginjou/svelte'
	import type { Post, PostFormData, PostRawFormData } from '../api/posts'
	import { formatLocation } from '../utils/mock-router'

	let { redirect = 'list' }: { redirect?: FormRedirect } = $props()

	const location = useLocation()
	const create = useCreate<Post, PostFormData>(() => ({
		resource: 'posts',
		redirect,
	}))

	let formData = $state<PostRawFormData>({
		title: 'Test001',
		status: 'draft',
	})
	let result = $state<Post | undefined>()

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault()

		const response = await create.save({
			title: formData.title ?? 'Untitled',
			status: formData.status ?? 'draft',
		})
		result = response.data
	}
</script>

<div class="stack">
	<code>URL: {formatLocation(location.value)}</code>

	<h1>useCreate</h1>

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
				<option value="draft">Draft</option>
				<option value="rejected">Rejected</option>
			</select>
		</label>

		<button type="submit" disabled={create.isLoading}>
			{create.isLoading ? 'Submitting...' : 'Submit'}
		</button>
	</form>

	<div class="stack">
		<h1>Result</h1>
		<pre>{JSON.stringify(result ?? null, null, 2)}</pre>
	</div>
</div>

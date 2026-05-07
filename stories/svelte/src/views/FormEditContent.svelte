<script lang="ts" module>
	import { ResourceActionType } from '@ginjou/core'

	export type FormRedirect = false | typeof ResourceActionType.List | typeof ResourceActionType.Create | typeof ResourceActionType.Show | typeof ResourceActionType.Edit
</script>

<script lang="ts">
	import type { MutationModeValues } from '@ginjou/core'
	import { MutationMode } from '@ginjou/core'
	import { useEdit, useLocation } from '@ginjou/svelte'
	import type { Post, PostFormData, PostRawFormData } from '../api/posts'
	import { formatLocation } from '../utils/mock-router'

	let {
		mutationMode = MutationMode.Pessimistic,
		redirect = 'show',
	}: {
		mutationMode?: MutationModeValues
		redirect?: FormRedirect
	} = $props()

	const location = useLocation()
	const edit = useEdit<Post, PostFormData>(() => ({
		resource: 'posts',
		mutationMode,
		redirect,
	}))

	let formData = $state<PostRawFormData>({})
	let hydratedRecordId = $state<string | undefined>()
	let result = $state<Post | undefined>()

	$effect(() => {
		if (edit.record && edit.record.id !== hydratedRecordId) {
			formData = {
				title: edit.record.title,
				status: edit.record.status,
			}
			hydratedRecordId = edit.record.id
			result = edit.record
		}
	})

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault()

		const response = await edit.save({
			title: formData.title ?? 'Updated title',
			status: formData.status ?? 'draft',
		})
		result = response.data
	}
</script>

<div class="stack">
	<code>URL: {formatLocation(location.value)}</code>

	<h1>useEdit</h1>

	{#if edit.isLoading && !edit.record}
		<div class="card">Loading ...</div>
	{:else}
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

			<button type="submit" disabled={edit.isLoading}>
				{edit.isLoading ? 'Submitting...' : 'Submit'}
			</button>
		</form>

		<div class="stack">
			<h1>Result</h1>
			<pre>{JSON.stringify(result ?? null, null, 2)}</pre>
		</div>
	{/if}
</div>

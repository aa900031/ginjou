<script lang="ts" module>
	import { ResourceActionType } from '@ginjou/core'

	export type FormRedirect = false | typeof ResourceActionType.List | typeof ResourceActionType.Create | typeof ResourceActionType.Show | typeof ResourceActionType.Edit
</script>

<script lang="ts">
	import type { MutationModeValues } from '@ginjou/core'
	import { MutationMode } from '@ginjou/core'
	import { useEdit, useLocation } from '@ginjou/svelte'
	import type { Post, PostFormData, PostRawFormData } from '../api/posts'
	import Button from '../components/Button.svelte'
	import Card from '../components/Card.svelte'
	import FieldLabel from '../components/FieldLabel.svelte'
	import Form from '../components/Form.svelte'
	import Input from '../components/Input.svelte'
	import JsonOutput from '../components/JsonOutput.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Select from '../components/Select.svelte'
	import Stack from '../components/Stack.svelte'
	import UrlBadge from '../components/UrlBadge.svelte'
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

	let formData = $state<PostRawFormData>({ title: '', status: 'draft' })
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

<Stack>
	<UrlBadge url={formatLocation(location.value)} />

	<PageTitle>useEdit</PageTitle>

	{#if edit.isLoading && !edit.record}
		<Card>Loading ...</Card>
	{:else}
		<Form onsubmit={handleSubmit}>
			<FieldLabel>
				<span>Title</span>
				<Input bind:value={formData.title} />
			</FieldLabel>

			<FieldLabel>
				<span>Status</span>
				<Select bind:value={formData.status}>
					<option value="draft">Draft</option>
					<option value="rejected">Rejected</option>
				</Select>
			</FieldLabel>

			<Button type="submit" disabled={edit.isLoading}>
				{edit.isLoading ? 'Submitting...' : 'Submit'}
			</Button>
		</Form>

		<Stack>
			<PageTitle>Result</PageTitle>
			<JsonOutput value={result} />
		</Stack>
	{/if}
</Stack>

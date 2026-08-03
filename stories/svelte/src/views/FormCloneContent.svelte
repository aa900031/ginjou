<script lang="ts" module>
	import { ResourceAction } from '@ginjou/core'

	export type FormRedirect = false | typeof ResourceAction.Type.List | typeof ResourceAction.Type.Create | typeof ResourceAction.Type.Show | typeof ResourceAction.Type.Edit
</script>

<script lang="ts">
	import type { MutationModeValues } from '@ginjou/core'
	import { MutationMode } from '@ginjou/core'
	import { useClone } from '@ginjou/svelte'
	import type { Post, PostFormData, PostRawFormData } from '@ginjou/storybook-shared/mock-data'
	import Button from '../components/Button.svelte'
	import Card from '../components/Card.svelte'
	import FieldLabel from '../components/FieldLabel.svelte'
	import Form from '../components/Form.svelte'
	import Input from '../components/Input.svelte'
	import JsonOutput from '../components/JsonOutput.svelte'
	import LocaleBadge from '../components/LocaleBadge.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Select from '../components/Select.svelte'
	import Stack from '../components/Stack.svelte'

	const {
		mutationMode = MutationMode.Pessimistic,
		redirect = 'list',
	}: {
		mutationMode?: MutationModeValues
		redirect?: FormRedirect
	} = $props()

	const clone = useClone<Post, PostFormData>(() => ({
		resource: 'posts',
		mutationMode,
		redirect,
	}))

	let formData = $state<PostRawFormData>({ title: '', status: 'draft' })
	let hydratedRecordId = $state<string | undefined>()

	$effect(() => {
		if (clone.record && clone.record.id !== hydratedRecordId) {
			formData = {
				title: clone.record.title,
				status: clone.record.status,
			}
			hydratedRecordId = clone.record.id
		}
	})

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault()
		await clone.save({
			title: formData.title ?? 'Copy',
			status: formData.status ?? 'draft',
		})
	}
</script>

<Stack>
	<LocaleBadge />

	<PageTitle>useClone</PageTitle>

	{#if clone.isLoading && !clone.record}
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
					<option value="draft">
						Draft
					</option>
					<option value="rejected">
						Rejected
					</option>
				</Select>
			</FieldLabel>

			<Button type="submit" disabled={clone.isLoading}>
				{clone.isLoading ? 'Submitting...' : 'Submit'}
			</Button>
		</Form>

		<Stack>
			<PageTitle>Source</PageTitle>
			<JsonOutput value={clone.record} />
		</Stack>
	{/if}
</Stack>

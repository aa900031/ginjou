<script lang="ts">
	import type { Post, PostFormData, PostRawFormData } from '@ginjou/storybook-shared/mock-data'
	import { useEdit, useGo } from '@ginjou/svelte'
	import Button from '../components/Button.svelte'
	import Card from '../components/Card.svelte'
	import FieldLabel from '../components/FieldLabel.svelte'
	import Form from '../components/Form.svelte'
	import InlineActions from '../components/InlineActions.svelte'
	import Input from '../components/Input.svelte'
	import LocaleBadge from '../components/LocaleBadge.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Select from '../components/Select.svelte'
	import Stack from '../components/Stack.svelte'

	const edit = useEdit<Post, PostFormData>(() => ({
		resource: 'posts',
		warnUnsaved: true,
		redirect: 'list',
	}))
	const go = useGo()

	let formData = $state<PostRawFormData>({ title: '', status: 'draft' })
	let hydratedRecordId = $state<string | undefined>()

	$effect(() => {
		if (edit.record && edit.record.id !== hydratedRecordId) {
			formData = {
				title: edit.record.title,
				status: edit.record.status,
			}
			hydratedRecordId = edit.record.id
		}
	})

	const isDirty = $derived(
		edit.record != null
		&& (formData.title !== edit.record.title || formData.status !== edit.record.status),
	)

	$effect(() => {
		edit.warnUnsavedActive = isDirty
	})

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault()

		await edit.save({
			title: formData.title ?? 'Updated title',
			status: formData.status ?? 'draft',
		})
	}
</script>

<Stack>
	<LocaleBadge />
	<PageTitle>Warn Unsaved</PageTitle>

	<Card>
		The guard mirrors the form's dirty state: change a field and it arms itself, type the
		original value back and it disarms. Navigating away while it is armed pops a native
		confirm — Cancel keeps you here, OK leaves. Closing or reloading the tab triggers the
		browser's own leave warning.
	</Card>

	<Card>
		Guard: <strong>{edit.warnUnsavedActive ? 'active' : 'inactive'}</strong>
	</Card>

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

	<InlineActions>
		<Button type="button" onclick={() => go({ to: '/posts' })}>
			Go to list
		</Button>
		<Button type="button" onclick={() => go({ to: `/posts/${edit.record?.id}` })}>
			Go to show
		</Button>
	</InlineActions>
</Stack>

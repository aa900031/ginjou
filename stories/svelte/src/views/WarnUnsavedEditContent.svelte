<script lang="ts">
	import type { Post, PostFormData, PostRawFormData } from '@ginjou/storybook-shared/mock-data'
	import { useEdit, useGo } from '@ginjou/svelte'
	import Button from '../components/Button.svelte'
	import Card from '../components/Card.svelte'
	import FieldLabel from '../components/FieldLabel.svelte'
	import Form from '../components/Form.svelte'
	import InlineActions from '../components/InlineActions.svelte'
	import Input from '../components/Input.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Select from '../components/Select.svelte'
	import Stack from '../components/Stack.svelte'

	const edit = useEdit<Post, PostFormData>(() => ({
		resource: 'posts',
		warnUnsaved: true,
		redirect: false,
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

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault()

		await edit.save({
			title: formData.title ?? 'Updated title',
			status: formData.status ?? 'draft',
		})
	}
</script>

<Stack>
	<PageTitle>Warn Unsaved</PageTitle>

	<Card>
		<strong>@ginjou/with-svelte-spa-router only guards tab close / reload.</strong>
		It cannot intercept in-app navigation, so change a field and then close or reload the tab
		to see the browser's leave warning. The navigation buttons below are kept for comparison:
		they will <em>not</em> prompt. Submitting clears the guard.
	</Card>

	<Card>
		Guard: <strong>{edit.warnUnsavedActive ? 'active' : 'inactive'}</strong>
	</Card>

	<Form onsubmit={handleSubmit}>
		<FieldLabel>
			<span>Title</span>
			<Input bind:value={formData.title} oninput={() => edit.warnUnsavedActive = true} />
		</FieldLabel>

		<FieldLabel>
			<span>Status</span>
			<Select bind:value={formData.status} onchange={() => edit.warnUnsavedActive = true}>
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
			Go to list (not intercepted)
		</Button>
		<Button type="button" onclick={() => go({ to: `/posts/${edit.record?.id}` })}>
			Go to show (not intercepted)
		</Button>
	</InlineActions>
</Stack>

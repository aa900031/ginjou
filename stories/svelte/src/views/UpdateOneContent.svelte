<script lang="ts">
	import { useUpdateOne } from '@ginjou/svelte'
	import type { Post, PostFormData, PostRawFormData } from '../api/posts'
	import Button from '../components/Button.svelte'
	import FieldLabel from '../components/FieldLabel.svelte'
	import Form from '../components/Form.svelte'
	import Input from '../components/Input.svelte'
	import JsonOutput from '../components/JsonOutput.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Select from '../components/Select.svelte'
	import Stack from '../components/Stack.svelte'
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

<Stack>
	<PageTitle>useUpdateOne</PageTitle>

	<Form onsubmit={handleSubmit}>
		<FieldLabel>
			<span>Title</span>
			<Input bind:value={formData.title} />
		</FieldLabel>

		<FieldLabel>
			<span>Status</span>
			<Select bind:value={formData.status}>
				<option value="draft">draft</option>
				<option value="published">published</option>
				<option value="rejected">rejected</option>
			</Select>
		</FieldLabel>

		<Button type="submit" disabled={mutation.isPending}>
			{mutation.isPending ? 'Submitting...' : 'Submit'}
		</Button>
	</Form>

	<Stack>
		<PageTitle>Result</PageTitle>
		<JsonOutput value={result} />
	</Stack>
</Stack>

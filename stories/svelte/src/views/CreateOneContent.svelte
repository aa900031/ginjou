<script lang="ts">
	import { useCreateOne } from '@ginjou/svelte'
	import type { Post, PostRawFormData } from '../api/posts'
	import Button from '../components/Button.svelte'
	import FieldLabel from '../components/FieldLabel.svelte'
	import Form from '../components/Form.svelte'
	import Input from '../components/Input.svelte'
	import JsonOutput from '../components/JsonOutput.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Select from '../components/Select.svelte'
	import Stack from '../components/Stack.svelte'

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

		const response = await mutation.mutateAsync({
			params: {
				...formData,
			},
		})
		result = response.data
	}
</script>

<Stack>
	<PageTitle>useCreateOne</PageTitle>

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

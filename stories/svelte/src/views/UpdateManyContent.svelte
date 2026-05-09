<script lang="ts">
	import { useUpdateMany } from '@ginjou/svelte'
	import type { Post, PostFormData, PostRawFormData } from '../api/posts'
	import Button from '../components/Button.svelte'
	import FieldLabel from '../components/FieldLabel.svelte'
	import Form from '../components/Form.svelte'
	import Input from '../components/Input.svelte'
	import JsonOutput from '../components/JsonOutput.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Stack from '../components/Stack.svelte'
	import { mockPostIds } from '../utils/posts'

	const mutation = useUpdateMany<Post, PostFormData>({
		resource: 'posts',
		ids: mockPostIds.slice(0, 2),
	})

	let formData = $state<PostRawFormData>({
		title: 'Next title',
	})
	let result = $state<Post[] | undefined>()

	async function handleSubmit(event: SubmitEvent): Promise<void> {
		event.preventDefault()

		await mutation.mutateAsync({
			params: {
				title: formData.title ?? 'Updated title',
			},
		}, {
			onSuccess: (data) => {
				result = data.data
			},
		})
	}
</script>

<Stack>
	<PageTitle>useUpdateMany</PageTitle>

	<Form onsubmit={handleSubmit}>
		<FieldLabel>
			<span>Title</span>
			<Input bind:value={formData.title} />
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

<script lang="ts" module>
	import { ResourceActionType } from '@ginjou/core'

	export type FormRedirect = false | typeof ResourceActionType.List | typeof ResourceActionType.Create | typeof ResourceActionType.Show | typeof ResourceActionType.Edit
</script>

<script lang="ts">
	import { useCreate, useLocation } from '@ginjou/svelte'
	import type { Post, PostFormData, PostRawFormData } from '../api/posts'
	import Button from '../components/Button.svelte'
	import FieldLabel from '../components/FieldLabel.svelte'
	import Form from '../components/Form.svelte'
	import Input from '../components/Input.svelte'
	import JsonOutput from '../components/JsonOutput.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Select from '../components/Select.svelte'
	import Stack from '../components/Stack.svelte'
	import UrlBadge from '../components/UrlBadge.svelte'
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

<Stack>
	<UrlBadge url={formatLocation(location.value)} />

	<PageTitle>useCreate</PageTitle>

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

		<Button type="submit" disabled={create.isLoading}>
			{create.isLoading ? 'Submitting...' : 'Submit'}
		</Button>
	</Form>

	<Stack>
		<PageTitle>Result</PageTitle>
		<JsonOutput value={result} />
	</Stack>
</Stack>

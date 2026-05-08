<script setup lang="ts">
import type { Post, PostRawFormData } from './api/posts'
import { useCreateOne } from '@ginjou/vue'
import { reactive, shallowRef } from 'vue'
import Button from './components/Button.vue'
import FieldLabel from './components/FieldLabel.vue'
import Form from './components/Form.vue'
import Input from './components/Input.vue'
import JsonOutput from './components/JsonOutput.vue'
import PageTitle from './components/PageTitle.vue'
import Select from './components/Select.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'

const { mutateAsync: createOne, isPending } = useCreateOne<Post, PostRawFormData>({
	resource: 'posts',
})

const formData = reactive<PostRawFormData>({
	status: 'draft',
})
const result = shallowRef<Post>()

async function handleSubmit() {
	await createOne({
		params: formData,
	}, {
		onSuccess: (data) => {
			result.value = data.data
		},
	})
}
</script>

<template>
	<StoryShell>
		<Stack>
			<PageTitle>useCreateOne</PageTitle>

			<Form @submit.prevent="handleSubmit">
				<FieldLabel>
					<span>Title</span>
					<Input
						id="post-title"
						v-model="formData.title"
						type="text"
					/>
				</FieldLabel>
				<FieldLabel>
					<span>Status</span>
					<Select id="post-status" v-model="formData.status">
						<option value="draft">
							Draft
						</option>
						<option value="published">
							Published
						</option>
						<option value="rejected">
							Rejected
						</option>
					</Select>
				</FieldLabel>
				<Button type="submit" :disabled="isPending">
					{{ isPending ? 'Submitting...' : 'Submit' }}
				</Button>
			</Form>

			<Stack>
				<PageTitle>Result</PageTitle>
				<JsonOutput :value="result" />
			</Stack>
		</Stack>
	</StoryShell>
</template>

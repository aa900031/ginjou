<script setup lang="ts">
import type { Post, PostFormData, PostRawFormData } from './api/posts'
import { useUpdateOne } from '@ginjou/vue'
import { reactive, shallowRef } from 'vue'
import Button from './components/Button.vue'
import FieldLabel from './components/FieldLabel.vue'
import Form from './components/Form.vue'
import Input from './components/Input.vue'
import JsonOutput from './components/JsonOutput.vue'
import PageTitle from './components/PageTitle.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'

const { mutateAsync: updateOne, isPending } = useUpdateOne<Post, PostFormData>({
	resource: 'posts',
	id: '6c6d3a48-8eef-4c96-a1ba-156bdfd3d389',
})

const formData = reactive<PostRawFormData>({
	title: 'Next title',
})
const result = shallowRef<Post>()

async function handleSubmit() {
	await updateOne({
		params: formData as PostFormData,
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
			<PageTitle>useUpdateOne</PageTitle>

			<Form @submit.prevent="handleSubmit">
				<FieldLabel>
					<span>Title</span>
					<Input
						id="post-title"
						v-model="formData.title"
						type="text"
					/>
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

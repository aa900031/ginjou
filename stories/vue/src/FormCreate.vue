<script setup lang="ts">
import type { Post, PostFormData, PostRawFormData } from './api/posts'
import { useCreate } from '@ginjou/vue'
import { reactive, shallowRef, toRef } from 'vue'
import Button from './components/Button.vue'
import FieldLabel from './components/FieldLabel.vue'
import Form from './components/Form.vue'
import Input from './components/Input.vue'
import JsonOutput from './components/JsonOutput.vue'
import LocaleBadge from './components/LocaleBadge.vue'
import PageTitle from './components/PageTitle.vue'
import Select from './components/Select.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'

const props = defineProps<{
	redirect?: any
}>()

const { save } = useCreate<Post, PostFormData>({
	redirect: toRef(props, 'redirect'),
})
const formData = reactive<PostRawFormData>({
	title: 'Test001',
	status: 'draft',
})
const result = shallowRef<Post>()

async function handleSubmit() {
	const resp = await save(formData as PostFormData)
	result.value = resp.data
}
</script>

<template>
	<StoryShell>
		<Stack>
			<LocaleBadge />
			<PageTitle>Posts Create</PageTitle>

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
						<option value="rejected">
							Rejected
						</option>
					</Select>
				</FieldLabel>
				<Button type="submit">
					Submit
				</Button>
			</Form>

			<Stack>
				<PageTitle>Result</PageTitle>
				<JsonOutput :value="result" />
			</Stack>
		</Stack>
	</StoryShell>
</template>

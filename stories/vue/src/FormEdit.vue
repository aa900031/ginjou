<script setup lang="ts">
import type { MutationModeValues } from '@ginjou/core'
import type { Post, PostFormData, PostRawFormData } from './api/posts'
import { useEdit } from '@ginjou/vue'
import { reactive, toRef, watch } from 'vue'
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
	mutationMode: MutationModeValues
	redirect?: any
}>()

const { record, save } = useEdit<Post, PostFormData>({
	mutationMode: toRef(props, 'mutationMode'),
	redirect: toRef(props, 'redirect'),
})
const formData = reactive<PostRawFormData>({})
const result = record

watch(record, (val) => {
	Object.assign(formData, val)
}, { immediate: true, deep: true })

async function handleSubmit() {
	await save(formData as PostFormData)
}
</script>

<template>
	<StoryShell>
		<Stack>
			<LocaleBadge />
			<PageTitle>Posts Edit</PageTitle>

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

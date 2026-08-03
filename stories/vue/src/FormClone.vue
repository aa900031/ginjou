<script setup lang="ts">
import type { MutationModeValues } from '@ginjou/core'
import type { Post, PostFormData, PostRawFormData } from '@ginjou/storybook-shared/mock-data'
import { useClone } from '@ginjou/vue'
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

const { record, save } = useClone<Post, PostFormData>({
	mutationMode: toRef(props, 'mutationMode'),
	redirect: toRef(props, 'redirect'),
})
const formData = reactive<PostRawFormData>({})

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
			<PageTitle>Posts Clone</PageTitle>

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
				<PageTitle>Source</PageTitle>
				<JsonOutput :value="record" />
			</Stack>
		</Stack>
	</StoryShell>
</template>

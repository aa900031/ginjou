<script setup lang="ts">
import type { Post, PostFormData, PostRawFormData } from '@ginjou/storybook-shared/mock-data'
import { useEdit, useGo } from '@ginjou/vue'
import { computed, reactive, watch } from 'vue'
import Button from '../components/Button.vue'
import Card from '../components/Card.vue'
import FieldLabel from '../components/FieldLabel.vue'
import Form from '../components/Form.vue'
import InlineActions from '../components/InlineActions.vue'
import Input from '../components/Input.vue'
import LocaleBadge from '../components/LocaleBadge.vue'
import PageTitle from '../components/PageTitle.vue'
import Select from '../components/Select.vue'
import Stack from '../components/Stack.vue'
import StoryShell from '../components/StoryShell.vue'

const { record, save, warnUnsavedActive } = useEdit<Post, PostFormData>({
	warnUnsaved: true,
	redirect: 'list',
})
const go = useGo()

const formData = reactive<PostRawFormData>({})

let hydratedId: Post['id'] | undefined
watch(record, (val) => {
	if (val == null || val.id === hydratedId)
		return

	hydratedId = val.id
	Object.assign(formData, val)
}, { immediate: true })

const isDirty = computed(() =>
	record.value != null
	&& (formData.title !== record.value.title || formData.status !== record.value.status),
)

watch(isDirty, (value) => {
	warnUnsavedActive.value = value
}, { immediate: true })

async function handleSubmit() {
	await save(formData as PostFormData)
}
</script>

<template>
	<StoryShell>
		<Stack>
			<LocaleBadge />
			<PageTitle>Warn Unsaved</PageTitle>

			<Card>
				The guard mirrors the form's dirty state: change a field and it arms itself, type the
				original value back and it disarms. Navigating away while it is armed pops a native
				confirm — Cancel keeps you here, OK leaves. Closing or reloading the tab triggers
				the browser's own leave warning.
			</Card>

			<Card>
				Guard: <strong>{{ warnUnsavedActive ? 'active' : 'inactive' }}</strong>
			</Card>

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
					<Select
						id="post-status"
						v-model="formData.status"
					>
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

			<InlineActions>
				<Button type="button" @click="go({ to: '/posts' })">
					Go to list
				</Button>
				<Button type="button" @click="go({ to: `/posts/${record?.id}` })">
					Go to show
				</Button>
			</InlineActions>
		</Stack>
	</StoryShell>
</template>

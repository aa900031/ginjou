<script setup lang="ts">
import type { Post, PostFormData, PostRawFormData } from '@ginjou/storybook-shared/mock-data'
import { useEdit, useGo } from '@ginjou/vue'
import { reactive, watch } from 'vue'
import Button from '../components/Button.vue'
import Card from '../components/Card.vue'
import FieldLabel from '../components/FieldLabel.vue'
import Form from '../components/Form.vue'
import InlineActions from '../components/InlineActions.vue'
import Input from '../components/Input.vue'
import PageTitle from '../components/PageTitle.vue'
import Select from '../components/Select.vue'
import Stack from '../components/Stack.vue'
import StoryShell from '../components/StoryShell.vue'

const { record, save, warnUnsavedActive } = useEdit<Post, PostFormData>({
	warnUnsaved: true,
	redirect: false,
})
const go = useGo()

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
			<PageTitle>Warn Unsaved</PageTitle>

			<Card>
				Change a field, then hit one of the navigation buttons: a native confirm shows up.
				Cancel keeps you on this page, OK leaves. Submitting clears the guard, so navigating
				after a successful save is silent. Closing / reloading the tab triggers the browser's
				own leave warning.
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
						@input="warnUnsavedActive = true"
					/>
				</FieldLabel>
				<FieldLabel>
					<span>Status</span>
					<Select
						id="post-status"
						v-model="formData.status"
						@change="warnUnsavedActive = true"
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

<script setup lang="ts">
import type { MutationModeValues } from '@ginjou/core'
import type { Post, PostFormData, PostRawFormData } from './api/posts'
import { useEdit } from '@ginjou/vue'
import { reactive, toRef, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
	mutationMode: MutationModeValues
	redirect?: any
}>()

const route = useRoute()
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
	<div>
		<code class="text-sm">URL: {{ route.fullPath }}</code>

		<h1 class="text-2xl font-bold">
			Posts Edit
		</h1>

		<form
			@submit.prevent="handleSubmit"
		>
			<div>
				<label for="post-title">
					Title
				</label>
				<input
					id="post-title"
					v-model="formData.title"
					type="text"
				>
			</div>
			<div>
				<label for="post-status">
					Status
				</label>
				<select
					id="post-status"
					v-model="formData.status"
				>
					<option value="draft">
						Draft
					</option>
					<option value="rejected">
						Rejected
					</option>
				</select>
			</div>
			<button type="submit">
				Submit
			</button>
		</form>

		<hr>
		<details open>
			<summary>Result</summary>
			<pre v-text="result ?? 'undefined'" />
		</details>
	</div>
</template>

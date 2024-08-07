<script setup lang="ts">
import { reactive, toRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useForm } from '@ginjou/vue'
import type { MutationModeValues } from '@ginjou/core'
import type { Post } from './api/posts'

const props = defineProps<{
	mutationMode: MutationModeValues
}>()

const route = useRoute()
const form = useForm<Post, Partial<Post>>({
	action: 'edit',
	mutationMode: toRef(props, 'mutationMode'),
})
const formData = reactive<Partial<Post>>({})
const result = form.record

watch(form.record, (val) => {
	Object.assign(formData, val)
}, { immediate: true, deep: true })

async function handleSubmit() {
	await form.save(formData)
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

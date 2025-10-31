<script setup lang="ts">
import type { Post, PostFormData, PostRawFormData } from './api/posts'
import { useForm } from '@ginjou/vue'
import { reactive, shallowRef, toRef } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
	redirect?: any
}>()

const route = useRoute()
const form = useForm<Post, PostFormData>({
	redirect: toRef(props, 'redirect'),
})
const formData = reactive<PostRawFormData>({
	title: 'Test001',
	status: 'draft',
})
const result = shallowRef<Post>()
async function handleSubmit() {
	const resp = await form.save(formData as PostFormData)
	result.value = resp.data
}
</script>

<template>
	<div>
		<code class="text-sm">URL: {{ route.fullPath }}</code>

		<h1 class="text-2xl font-bold">
			Posts Create
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

<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useForm } from '@ginjou/vue'
import type { Post } from './api/posts'

const route = useRoute()
const form = useForm<Post, Partial<Post>>()
const formData = reactive({
	title: 'Test001',
	status: 'draft',
})
async function handleSubmit() {
	await form.save(formData)
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
	</div>
</template>

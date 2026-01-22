<script setup lang="ts">
import type { Post, PostRawFormData } from './api/posts'
import { useUpdateMany } from '@ginjou/vue'
import { reactive, shallowRef } from 'vue'

const { mutateAsync: updateMany, isPending } = useUpdateMany<Post, PostRawFormData>({
	resource: 'posts',
	ids: [
		'6c6d3a48-8eef-4c96-a1ba-156bdfd3d389',
		'ce08aff6-41db-40e0-b3bb-65a256b2e780',
	],
})

const formData = reactive<PostRawFormData>({
	title: 'Next title',
})
const result = shallowRef<Post[]>()

async function handleSubmit() {
	await updateMany({
		params: formData,
	}, {
		onSuccess: (data) => {
			result.value = data.data
		},
	})
}
</script>

<template>
	<div>
		<h1 class="text-2xl font-bold">
			useUpdateMany
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
			<button type="submit" :disabled="isPending">
				{{ isPending ? 'Submitting...' : 'Submit' }}
			</button>
		</form>

		<hr>
		<details open>
			<summary>Result</summary>
			<pre v-text="result ?? 'undefined'" />
		</details>
	</div>
</template>

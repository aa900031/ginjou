<script setup lang="ts">
import type { Post } from './api/posts'
import { useList } from '@ginjou/vue'
import { reactive, watchPostEffect } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const {
	records,
	sorters,
} = useList<Post>({
	syncRoute: true,
})

const formData = reactive({
	id: false,
	title: true,
})

watchPostEffect(() => {
	sorters.value = [
		{
			field: 'title',
			order: formData.title ? 'asc' : 'desc',
		},
		{
			field: 'id',
			order: formData.id ? 'asc' : 'desc',
		},
	]
})
</script>

<template>
	<div>
		<code class="text-sm">URL: {{ route.fullPath }}</code>

		<h1 class="text-2xl font-bold">
			Posts
		</h1>

		<div class="flex items-baseline space-x-4">
			<button @click="formData.title = !formData.title">
				{{ formData.title ? `Sort Title by DESC` : `Sort Title by ASC` }}
			</button>
			<button @click="formData.id = !formData.id">
				{{ formData.id ? `Sort ID by DESC` : `Sort ID by ASC` }}
			</button>
		</div>

		<table class="table-auto w-full">
			<thead>
				<tr>
					<th>ID</th>
					<th>Title</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="record in records" :key="record.id">
					<td>
						{{ record.id }}
					</td>
					<td>
						{{ record.title }}
					</td>
					<td>
						{{ record.status }}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

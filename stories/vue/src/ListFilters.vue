<script setup lang="ts">
import { reactive, watchPostEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useList } from '@ginjou/vue'
import { FilterOperator } from '@ginjou/core'
import type { Post } from './api/posts'

const route = useRoute()

const {
	records,
	filters,
} = useList<Post>({
	syncRoute: true,
})

const formData = reactive({
	title: '',
	id: '',
})

watchPostEffect(() => {
	filters.value = [
		formData.title
			? {
					field: 'title',
					operator: FilterOperator.contains,
					value: formData.title,
				}
			: undefined as any,
		formData.id
			? {
					field: 'id',
					operator: FilterOperator.eq,
					value: formData.id,
				}
			: undefined as any,
	].filter(Boolean)
})
</script>

<template>
	<div>
		<code class="text-sm">URL: {{ route.fullPath }}</code>

		<h1 class="text-2xl font-bold">
			Posts
		</h1>

		<div class="flex items-baseline space-x-4">
			<input
				v-model="formData.title"
				type="text"
				placeholder="Search by Title"
			>
			<input
				v-model="formData.id"
				type="text"
				placeholder="Search by ID"
			>
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
				<tr
					v-for="record in records"
					:key="record.id"
				>
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

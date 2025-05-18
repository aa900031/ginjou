<script setup lang="ts">
import type { Post } from './api/posts'
import { useList } from '@ginjou/vue'
import { reactive, unref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const {
	records,
	sorters,
} = useList<Post>({
	syncRoute: {
		currentPage: false,
		perPage: false,
		filters: false,
		sorters: {
			field: 'sorter',
			parse: (str) => {
				const raw = JSON.parse(str) as [string, string][]
				return raw.map(item => ({
					field: item[0],
					order: item[1] as any,
				}))
			},
			stringify: (value) => {
				const raw = value.map(item => [item.field, item.order])
				return JSON.stringify(raw)
			},
		},
	},
})

const formData = reactive<{
	id: boolean | undefined
	title: boolean | undefined
}>({
	id: undefined,
	title: undefined,
})

watch(() => unref(formData), (data) => {
	sorters.value = [
		data.title != null
			? {
					field: 'title',
					order: data.title ? 'asc' : 'desc',
				}
			: undefined as any,
		data.id != null
			? {
					field: 'id',
					order: data.id ? 'asc' : 'desc',
				}
			: undefined as any,
	].filter(Boolean)
}, {
	flush: 'post',
	deep: true,
	immediate: true,
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

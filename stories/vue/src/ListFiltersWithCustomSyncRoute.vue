<script setup lang="ts">
import type { Post } from './api/posts'
import { Filter, FilterOperator } from '@ginjou/core'
import { useList } from '@ginjou/vue'
import { reactive, unref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const {
	records,
	filters,
} = useList<Post>({
	syncRoute: {
		currentPage: false,
		perPage: false,
		sorters: false,
		filters: {
			field: 'filter',
			parse: (str) => {
				const raw = JSON.parse(str) as ([string, string, any] | [string, any[]])[]
				const resolve = (item: [string, string, any] | [string, any[]]): Filter => {
					if (item.length === 2) {
						return {
							operator: item[0] as any,
							value: item[1].map(sub => resolve(sub))
						}
					}
					return {
						field: item[0],
						operator: item[1] as any,
						value: item[2],
					}
				}
				return raw.map(item => resolve(item))
			},
			stringify: (value) => {
				const resolve = (item: Filter) => {
					if ('field' in item) {
						return [item.field, item.operator, item.value]
					}
					return [item.operator, item.value]
				}
				const raw = value.map(item => resolve(item))
				return JSON.stringify(raw)
			},
		},
	},
})

const formData = reactive({
	title: '',
	id: '',
})

watch(() => unref(formData), (data) => {
	filters.value = [
		data.title
			? {
					field: 'title',
					operator: FilterOperator.contains,
					value: data.title,
				}
			: undefined as any,
		data.id
			? {
					field: 'id',
					operator: FilterOperator.eq,
					value: data.id,
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

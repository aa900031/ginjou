<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useDelete, useList } from '@ginjou/vue'
import type { MutationModeValues } from '@ginjou/core'
import type { Post } from './api/posts'

const props = defineProps<{
	mutationMode: MutationModeValues
}>()

const route = useRoute()

const {
	records,
} = useList<Post>({
	syncRoute: false,
})
const { mutateAsync: del } = useDelete()

async function handleDeleteClick(record: Post) {
	await del({
		id: record.id,
		resource: 'posts',
		mutationMode: props.mutationMode,
	})
}
</script>

<template>
	<div>
		<code class="text-sm">URL: {{ route.fullPath }}</code>

		<h1 class="text-2xl font-bold">
			Posts
		</h1>

		<table class="table-auto w-full">
			<thead>
				<tr>
					<th>ID</th>
					<th>Title</th>
					<th>Status</th>
					<th>Actions</th>
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
					<td>
						<button @click="handleDeleteClick(record)">
							Delete
						</button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

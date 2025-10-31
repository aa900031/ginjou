<script setup lang="ts">
import type { MutationModeValues } from '@ginjou/core'
import type { Post } from './api/posts'
import { useDeleteOne, useList } from '@ginjou/vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
	mutationMode: MutationModeValues
}>()

const route = useRoute()

const {
	records,
} = useList<Post>({
	syncRoute: false,
})
const { mutateAsync: del } = useDeleteOne()

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
						<button
							:data-testid="`delete--${record.id}`"
							@click="handleDeleteClick(record)"
						>
							Delete
						</button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

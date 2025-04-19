<script setup lang="ts">
import type { MutationModeValues } from '@ginjou/core'
import type { Post } from './api/posts'
import { useDeleteMany, useList } from '@ginjou/vue'
import { ref, unref } from 'vue'
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
const { mutateAsync: del } = useDeleteMany()
const ids = ref<string[]>([])

async function handleDeleteClick() {
	const _ids = unref(ids).slice()
	ids.value.length = 0

	await del({
		ids: _ids,
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

		<button
			:disabled="ids.length === 0"
			data-testid="delete-selected"
			@click="handleDeleteClick"
		>
			Delete Selected
		</button>

		<table class="table-auto w-full">
			<thead>
				<tr>
					<th>V</th>
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
						<input
							v-model="ids"
							type="checkbox"
							:data-testid="`pick-to-delete--${record.id}`"
							:value="record.id"
						>
					</td>
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

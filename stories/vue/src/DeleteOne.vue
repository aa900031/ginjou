<script setup lang="ts">
import type { MutationModeValues } from '@ginjou/core'
import type { Post } from './api/posts'
import { useDeleteOne, useList } from '@ginjou/vue'
import Button from './components/Button.vue'
import LocaleBadge from './components/LocaleBadge.vue'
import PageTitle from './components/PageTitle.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'
import Table from './components/Table.vue'
import Td from './components/Td.vue'
import Th from './components/Th.vue'

const props = defineProps<{
	mutationMode: MutationModeValues
}>()

const { records } = useList<Post>({ syncRoute: false })
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
	<StoryShell>
		<Stack>
			<LocaleBadge />
			<PageTitle>Posts</PageTitle>

			<Table>
				<thead>
					<tr>
						<Th>ID</Th>
						<Th>Title</Th>
						<Th>Status</Th>
						<Th>Actions</Th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="record in records"
						:key="record.id"
					>
						<Td>{{ record.id }}</Td>
						<Td>{{ record.title }}</Td>
						<Td>{{ record.status }}</Td>
						<Td>
							<Button
								:data-testid="`delete--${record.id}`"
								@click="handleDeleteClick(record)"
							>
								Delete
							</Button>
						</Td>
					</tr>
				</tbody>
			</Table>
		</Stack>
	</StoryShell>
</template>

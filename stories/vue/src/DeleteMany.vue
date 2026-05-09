<script setup lang="ts">
import type { MutationModeValues } from '@ginjou/core'
import type { Post } from './api/posts'
import { useDeleteMany, useList } from '@ginjou/vue'
import { ref, unref } from 'vue'
import Button from './components/Button.vue'
import InlineActions from './components/InlineActions.vue'
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
	<StoryShell>
		<Stack>
			<LocaleBadge />
			<PageTitle>Posts</PageTitle>

			<InlineActions>
				<Button
					:disabled="ids.length === 0"
					data-testid="delete-selected"
					@click="handleDeleteClick"
				>
					Delete Selected
				</Button>
			</InlineActions>

			<Table>
				<thead>
					<tr>
						<Th>V</Th>
						<Th>ID</Th>
						<Th>Title</Th>
						<Th>Status</Th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="record in records"
						:key="record.id"
					>
						<Td>
							<input
								v-model="ids"
								type="checkbox"
								:data-testid="`pick-to-delete--${record.id}`"
								:value="record.id"
							>
						</Td>
						<Td>{{ record.id }}</Td>
						<Td>{{ record.title }}</Td>
						<Td>{{ record.status }}</Td>
					</tr>
				</tbody>
			</Table>
		</Stack>
	</StoryShell>
</template>

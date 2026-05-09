<script setup lang="ts">
import type { Post } from './api/posts'
import { useList } from '@ginjou/vue'
import { reactive, unref, watch } from 'vue'
import Button from './components/Button.vue'
import InlineActions from './components/InlineActions.vue'
import LocaleBadge from './components/LocaleBadge.vue'
import PageTitle from './components/PageTitle.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'
import Table from './components/Table.vue'
import Td from './components/Td.vue'
import Th from './components/Th.vue'

const {
	records,
	sorters,
} = useList<Post>({
	syncRoute: true,
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
	<StoryShell>
		<Stack>
			<LocaleBadge />
			<PageTitle>Posts</PageTitle>

			<InlineActions>
				<Button @click="formData.title = !formData.title">
					{{ formData.title ? 'Sort Title by DESC' : 'Sort Title by ASC' }}
				</Button>
				<Button @click="formData.id = !formData.id">
					{{ formData.id ? 'Sort ID by DESC' : 'Sort ID by ASC' }}
				</Button>
			</InlineActions>

			<Table>
				<thead>
					<tr>
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
						<Td>{{ record.id }}</Td>
						<Td>{{ record.title }}</Td>
						<Td>{{ record.status }}</Td>
					</tr>
				</tbody>
			</Table>
		</Stack>
	</StoryShell>
</template>

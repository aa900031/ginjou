<script setup lang="ts">
import type { Post } from './api/posts'
import { FilterOperator } from '@ginjou/core'
import { useList } from '@ginjou/vue'
import { reactive, unref, watch } from 'vue'
import FieldLabel from './components/FieldLabel.vue'
import InlineActions from './components/InlineActions.vue'
import Input from './components/Input.vue'
import LocaleBadge from './components/LocaleBadge.vue'
import PageTitle from './components/PageTitle.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'
import Table from './components/Table.vue'
import Td from './components/Td.vue'
import Th from './components/Th.vue'

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
	<StoryShell>
		<Stack>
			<LocaleBadge />
			<PageTitle>Posts</PageTitle>

			<InlineActions>
				<FieldLabel>
					<span>Title</span>
					<Input
						v-model="formData.title"
						type="text"
						placeholder="Search by Title"
					/>
				</FieldLabel>
				<FieldLabel>
					<span>ID</span>
					<Input
						v-model="formData.id"
						type="text"
						placeholder="Search by ID"
					/>
				</FieldLabel>
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

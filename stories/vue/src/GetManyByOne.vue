<script setup lang="ts">
import type { Post } from '@ginjou/storybook-shared/mock-data'
import { useGetManyByOne } from '@ginjou/vue'
import { computed } from 'vue'
import Card from './components/Card.vue'
import PageTitle from './components/PageTitle.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'
import Table from './components/Table.vue'
import Td from './components/Td.vue'
import Th from './components/Th.vue'

const props = defineProps<{
	ids: Post['id'][]
}>()

const { records, isFetching } = useGetManyByOne<Post>({
	ids: computed(() => props.ids),
	resource: 'posts',
})
</script>

<template>
	<StoryShell>
		<Stack>
			<PageTitle>useGetManyByOne</PageTitle>

			<Card v-if="isFetching">
				Loading...
			</Card>
			<Card v-else-if="!records?.length">
				No records
			</Card>
			<Table v-else>
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

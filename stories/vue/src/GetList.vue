<script setup lang="ts">
import type { Post } from './api/posts'
import { useGetList } from '@ginjou/vue'
import Card from './components/Card.vue'
import PageTitle from './components/PageTitle.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'
import Table from './components/Table.vue'
import Td from './components/Td.vue'
import Th from './components/Th.vue'

const { records, isFetching } = useGetList<Post>({
	resource: 'posts',
})
</script>

<template>
	<StoryShell>
		<Stack>
			<PageTitle>useGetList</PageTitle>

			<Card v-if="isFetching">
				Loading...
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

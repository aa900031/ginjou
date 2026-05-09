<script setup lang="ts">
import type { Post } from './api/posts'
import { useInfiniteList } from '@ginjou/vue'
import Button from './components/Button.vue'
import FieldLabel from './components/FieldLabel.vue'
import InlineActions from './components/InlineActions.vue'
import LocaleBadge from './components/LocaleBadge.vue'
import PageTitle from './components/PageTitle.vue'
import Select from './components/Select.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'
import Table from './components/Table.vue'
import Td from './components/Td.vue'
import Th from './components/Th.vue'

const {
	records,
	perPage,
	hasNextPage,
	fetchNextPage,
} = useInfiniteList<Post>({
	syncRoute: true,
})

function handleMoreClick() {
	fetchNextPage()
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
					</tr>
				</thead>
				<tbody>
					<template
						v-for="(record, i) in records"
						:key="i"
					>
						<tr
							v-for="item in record"
							:key="item.id"
						>
							<Td>{{ item.id }}</Td>
							<Td>{{ item.title }}</Td>
							<Td>{{ item.status }}</Td>
						</tr>
					</template>
					<tr>
						<Td colspan="3">
							<Button
								:disabled="!hasNextPage"
								@click="handleMoreClick"
							>
								More
							</Button>
						</Td>
					</tr>
				</tbody>
			</Table>

			<InlineActions>
				<FieldLabel>
					<span>Per page</span>
					<Select v-model="perPage">
						<option
							v-for="count in [10, 20, 30, 40]"
							:key="count"
							:value="count"
						>
							{{ count }}
						</option>
					</Select>
				</FieldLabel>
			</InlineActions>
		</Stack>
	</StoryShell>
</template>

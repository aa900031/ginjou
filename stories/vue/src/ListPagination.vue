<script setup lang="ts">
import type { Post } from './api/posts'
import { useList } from '@ginjou/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import FieldLabel from './components/FieldLabel.vue'
import InlineActions from './components/InlineActions.vue'
import Input from './components/Input.vue'
import PageTitle from './components/PageTitle.vue'
import Select from './components/Select.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'
import Table from './components/Table.vue'
import Td from './components/Td.vue'
import Th from './components/Th.vue'
import UrlBadge from './components/UrlBadge.vue'
import Button from './components/Button.vue'

const route = useRoute()

const {
	records,
	pageCount,
	perPage,
	currentPage,
} = useList<Post>({
	syncRoute: true,
})

const hasNext = computed(() => pageCount.value == null ? false : currentPage.value < pageCount.value)
const hasPrev = computed(() => currentPage.value > 1)
</script>

<template>
	<StoryShell>
		<Stack>
			<UrlBadge :url="route.fullPath" />
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

			<InlineActions>
				<Button :disabled="!hasPrev" @click="currentPage = 1">
					First
				</Button>
				<Button :disabled="!hasPrev" @click="currentPage = currentPage - 1">
					Previous
				</Button>
				<Button :disabled="!hasNext" @click="currentPage = currentPage + 1">
					Next
				</Button>
				<Button :disabled="!hasNext" @click="currentPage = pageCount!">
					Last
				</Button>
				<span class="text-sm text-slate-600 dark:text-slate-400">Page {{ currentPage }} / {{ pageCount }}</span>
				<FieldLabel>
					<span>Go to</span>
					<Input v-model="currentPage" type="number" min="1" :max="pageCount" style="width: 5rem;" />
				</FieldLabel>
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

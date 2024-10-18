<script setup lang="ts">
import type { Post } from './api/posts'
import { useList } from '@ginjou/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

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
				</tr>
			</tbody>
		</table>
		<div class="flex items-baseline space-x-4">
			<div>
				<button :disabled="!hasPrev" @click="currentPage = 1">
					First
				</button>
				<button :disabled="!hasPrev" @click="currentPage = currentPage - 1">
					Previous
				</button>
				<button :disabled="!hasNext" @click="currentPage = currentPage + 1">
					Next
				</button>
				<button :disabled="!hasNext" @click="currentPage = pageCount!">
					Last
				</button>
			</div>
			<div>
				Page {{ currentPage }} / {{ pageCount }}
			</div>
			<div>
				Go to page:
				<input v-model="currentPage" type="number" min="1" :max="pageCount">
			</div>
			<div>
				Per page:
				<select v-model="perPage">
					<option
						v-for="count in [10, 20, 30, 40]"
						:key="count"
						:value="count"
					>
						{{ count }}
					</option>
				</select>
			</div>
		</div>
	</div>
</template>

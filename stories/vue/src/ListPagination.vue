<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useList } from '@ginjou/vue'
import type { Post } from './api/posts'

const route = useRoute()

const {
	isLoading,
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

		<template v-if="isLoading">
			Loading...
		</template>
		<template v-else>
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
					<input v-model="currentPage" type="number">
				</div>
				<div>
					Per page:
					<input v-model="perPage" type="number" min="10" max="100">
				</div>
			</div>
		</template>
	</div>
</template>

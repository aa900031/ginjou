<script setup lang="ts">
import type { Post } from './api/posts'
import { useInfiniteList } from '@ginjou/vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const {
	records,
	perPage,
	hasNextPage,
	fetchNextPage,
} = useInfiniteList<Post>({
	resource: 'posts',
	syncRoute: true,
})

function handleMoreClick() {
	fetchNextPage()
}
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
				<template
					v-for="(record, i) in records"
					:key="i"
				>
					<tr
						v-for="item in record"
						:key="item.id"
					>
						<td>
							{{ item.id }}
						</td>
						<td>
							{{ item.title }}
						</td>
						<td>
							{{ item.status }}
						</td>
					</tr>
				</template>
				<tr>
					<td>
						<button
							:disabled="!hasNextPage"
							@click="handleMoreClick"
						>
							More
						</button>
					</td>
				</tr>
			</tbody>
		</table>
		<div class="flex items-baseline space-x-4">
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

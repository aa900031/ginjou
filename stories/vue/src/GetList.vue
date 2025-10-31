<script setup lang="ts">
import type { Post } from './api/posts'
import { useGetList } from '@ginjou/vue'

const { records, isFetching } = useGetList<Post>({
	resource: 'posts',
})
</script>

<template>
	<div>
		<h1 class="text-2xl font-bold">
			useGetList
		</h1>
		<div v-if="isFetching">
			Loading...
		</div>
		<table v-else class="table-auto w-full">
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
	</div>
</template>

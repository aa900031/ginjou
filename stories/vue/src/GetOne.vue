<script setup lang="ts">
import type { Post } from './api/posts'
import { useGetOne } from '@ginjou/vue'

const { record, isFetching } = useGetOne<Post>({
	id: '6c6d3a48-8eef-4c96-a1ba-156bdfd3d389',
	resource: 'posts',
})
</script>

<template>
	<div>
		<h1 class="text-2xl font-bold">
			useGetOne
		</h1>

		<div v-if="isFetching">
			Loading...
		</div>
		<div v-else-if="record">
			<p>id: {{ record?.id }}</p>
			<p>title: {{ record?.title }}</p>
			<p>status: {{ record?.status }}</p>
		</div>
		<div v-else>
			Not found
		</div>
	</div>
</template>

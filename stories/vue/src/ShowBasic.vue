<script setup lang="ts">
import type { Post } from './api/posts'
import { useShow } from '@ginjou/vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { record } = useShow<Post>()
</script>

<template>
	<div>
		<code class="text-sm">URL: {{ route.fullPath }}</code>

		<h1 class="text-2xl font-bold">
			Posts Details
		</h1>

		<p>id: {{ record?.id }}</p>
		<p>title: {{ record?.title }}</p>
		<p>status: {{ record?.status }}</p>
	</div>
</template>

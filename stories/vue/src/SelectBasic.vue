<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSelect } from '@ginjou/vue'
import type { Post } from './api/posts'

const value = ref<string>()
const keyword = ref<string>()

const {
	options,
	setSearch,
} = useSelect<Post>({
	resource: 'posts',
	value,
})

watch(keyword, (val) => {
	setSearch(val)
})
</script>

<template>
	<input
		v-model="keyword"
		placeholder="Keyword for select"
	>
	<select v-model="value">
		<option
			v-for="opt in options"
			:key="opt.value"
			:value="opt.value"
		>
			{{ opt.label }}
		</option>
	</select>
</template>

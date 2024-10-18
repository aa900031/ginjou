<script setup lang="ts">
import type { Post } from './api/posts'
import { useSelect } from '@ginjou/vue'
import { ref } from 'vue'

const value = ref<string>()

const {
	options,
	search,
} = useSelect<Post>({
	resource: 'posts',
	value,
})
</script>

<template>
	<input
		v-model="search"
		placeholder="Keyword for option list"
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

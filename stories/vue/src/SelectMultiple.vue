<script setup lang="ts">
import type { Post } from './api/posts'
import { useSelect } from '@ginjou/vue'
import { ref } from 'vue'
import Card from './components/Card.vue'
import FieldLabel from './components/FieldLabel.vue'
import Input from './components/Input.vue'
import PageTitle from './components/PageTitle.vue'
import Select from './components/Select.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'

const value = ref<string[]>()

const {
	options,
	search,
} = useSelect<Post>({
	resource: 'posts',
	value,
})
</script>

<template>
	<StoryShell>
		<Stack>
			<PageTitle>useSelect</PageTitle>

			<FieldLabel>
				<span>Search</span>
				<Input v-model="search" placeholder="Keyword for option list" />
			</FieldLabel>
			<FieldLabel>
				<span>Posts</span>
				<Select
					v-model="value"
					multiple
					:size="5"
				>
					<option
						v-for="opt in options"
						:key="opt.value"
						:value="opt.value"
					>
						{{ opt.label }}
					</option>
				</Select>
			</FieldLabel>

			<Card>Selected value: {{ value ?? 'None' }}</Card>
		</Stack>
	</StoryShell>
</template>

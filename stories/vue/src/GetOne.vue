<script setup lang="ts">
import type { Post } from './api/posts'
import { useGetOne } from '@ginjou/vue'
import Card from './components/Card.vue'
import JsonOutput from './components/JsonOutput.vue'
import PageTitle from './components/PageTitle.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'

const { record, isFetching } = useGetOne<Post>({
	id: '6c6d3a48-8eef-4c96-a1ba-156bdfd3d389',
	resource: 'posts',
})
</script>

<template>
	<StoryShell>
		<Stack>
			<PageTitle>useGetOne</PageTitle>

			<Card v-if="isFetching">
				Loading...
			</Card>
			<Card v-else-if="!record">
				Not found
			</Card>
			<JsonOutput v-else :value="record" />
		</Stack>
	</StoryShell>
</template>

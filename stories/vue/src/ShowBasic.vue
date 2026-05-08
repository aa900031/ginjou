<script setup lang="ts">
import type { Post } from './api/posts'
import { useShow } from '@ginjou/vue'
import { useRoute } from 'vue-router'
import JsonOutput from './components/JsonOutput.vue'
import PageTitle from './components/PageTitle.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'
import UrlBadge from './components/UrlBadge.vue'

const route = useRoute()
const { record } = useShow<Post>()
</script>

<template>
	<StoryShell>
		<Stack>
			<UrlBadge :url="route.fullPath" />
			<PageTitle>Posts Details</PageTitle>

			<JsonOutput :value="record" />
		</Stack>
	</StoryShell>
</template>

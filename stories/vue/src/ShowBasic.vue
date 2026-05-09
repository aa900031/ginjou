<script setup lang="ts">
import type { Post } from './api/posts'
import { useShow } from '@ginjou/vue'
import JsonOutput from './components/JsonOutput.vue'
import LocaleBadge from './components/LocaleBadge.vue'
import PageTitle from './components/PageTitle.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'

const { record } = useShow<Post>()
</script>

<template>
	<StoryShell>
		<Stack>
			<LocaleBadge />
			<PageTitle>Posts Details</PageTitle>

			<JsonOutput :value="record" />
		</Stack>
	</StoryShell>
</template>

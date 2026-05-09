<script setup lang="ts">
import { useLogin, usePermissions } from '@ginjou/vue'
import Card from './components/Card.vue'
import JsonOutput from './components/JsonOutput.vue'
import PageTitle from './components/PageTitle.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'

const { mutateAsync: login } = useLogin()
const { data: permissions, isLoading } = usePermissions<string[]>()

login()
</script>

<template>
	<StoryShell>
		<Stack>
			<PageTitle>usePermissions</PageTitle>

			<Card v-if="permissions == null || isLoading">
				Loading ...
			</Card>
			<JsonOutput v-else :value="permissions" />
		</Stack>
	</StoryShell>
</template>

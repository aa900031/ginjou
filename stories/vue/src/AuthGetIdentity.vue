<script setup lang="ts">
import { useGetIdentity, useLogin } from '@ginjou/vue'
import Card from './components/Card.vue'
import PageTitle from './components/PageTitle.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'

const { mutateAsync: login } = useLogin()
const { data: identity, isLoading } = useGetIdentity<{ username: string }>()

login()
</script>

<template>
	<StoryShell>
		<Stack>
			<PageTitle>useGetIdentity</PageTitle>

			<Card v-if="identity == null || isLoading">
				Loading ...
			</Card>
			<Card v-else>
				Hi! {{ identity.username }}
			</Card>
		</Stack>
	</StoryShell>
</template>

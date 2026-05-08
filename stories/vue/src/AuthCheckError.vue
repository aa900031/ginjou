<script setup lang="ts">
import { useAuthenticated, useCheckError, useLogin } from '@ginjou/vue'
import Button from './components/Button.vue'
import Card from './components/Card.vue'
import PageTitle from './components/PageTitle.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'

const { data: authenticated, isLoading } = useAuthenticated()
const { mutateAsync: login, isPending: isLoginLoading } = useLogin()
const { mutateAsync: checkError, isPending: isCheckLoading } = useCheckError()

async function handleCheckClick() {
	const error = new Error('Auth')
	;(error as any).isAuthError = true
	await checkError(error)
}

async function handleLoginClick() {
	login()
}

login()
</script>

<template>
	<StoryShell>
		<Stack>
			<PageTitle>useCheckError</PageTitle>

			<template v-if="authenticated == null || isLoading || isLoginLoading">
				<Card>Loading ...</Card>
			</template>
			<template v-else-if="authenticated?.authenticated">
				<Card>
					<Stack>
						<p>Check Auth Error</p>
						<Button @click="handleCheckClick">
							{{ isCheckLoading ? 'Triggering...' : 'Trigger' }}
						</Button>
					</Stack>
				</Card>
			</template>
			<template v-else-if="!authenticated?.authenticated">
				<Card>
					<Stack>
						<p>Please login again</p>
						<Button @click="handleLoginClick">
							Login
						</Button>
					</Stack>
				</Card>
			</template>
		</Stack>
	</StoryShell>
</template>

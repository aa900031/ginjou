<script setup lang="ts">
import { useAuthenticated, useLogin, useLogout } from '@ginjou/vue'
import Button from './components/Button.vue'
import Card from './components/Card.vue'
import PageTitle from './components/PageTitle.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'

const { data: authenticated, isLoading } = useAuthenticated()
const { mutateAsync: logout, isPending: isLogoutLoading } = useLogout()
const { mutateAsync: login, isPending: isLoginLoading } = useLogin()

async function handleLogoutClick() {
	logout()
}
async function handleLoginClick() {
	login()
}
</script>

<template>
	<StoryShell>
		<Stack>
			<PageTitle>useAuthenticated / useLogin / useLogout</PageTitle>

			<template v-if="isLoading || authenticated == null">
				<Card>Check Auth ...</Card>
			</template>
			<template v-else-if="authenticated.authenticated === true">
				<Card>
					<Stack>
						<p>Hi! You are authenticated.</p>
						<Button
							data-testid="btn-logout"
							:disabled="isLogoutLoading"
							@click="handleLogoutClick"
						>
							{{ isLogoutLoading ? 'Logout...' : 'Logout' }}
						</Button>
					</Stack>
				</Card>
			</template>
			<template v-else-if="authenticated.authenticated === false">
				<Card>
					<Stack>
						<p>You are unauthenticated. Please login first.</p>
						<Button
							data-testid="btn-login"
							:disabled="isLoginLoading"
							@click="handleLoginClick"
						>
							{{ isLoginLoading ? 'Login...' : 'Login' }}
						</Button>
					</Stack>
				</Card>
			</template>
		</Stack>
	</StoryShell>
</template>

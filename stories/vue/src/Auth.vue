<script setup lang="ts">
import { useAuthenticated, useLogin, useLogout } from '@ginjou/vue'

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
	<template v-if="isLoading || authenticated == null">
		Check Auth ...
	</template>
	<template v-else-if="authenticated.authenticated === true">
		Hi! <br>
		<button
			data-testid="btn-logout"
			:disabled="isLogoutLoading"
			@click="handleLogoutClick"
		>
			Logout {{ isLogoutLoading ? '...' : '' }}
		</button>
	</template>
	<template v-else-if="authenticated.authenticated === false">
		You are unauthenticated, Please Login first!<br>
		<button
			data-testid="btn-login"
			:disabled="isLoginLoading"
			@click="handleLoginClick"
		>
			Login {{ isLoginLoading ? '...' : '' }}
		</button>
	</template>
</template>

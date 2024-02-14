<script setup lang="ts">
import { useAuthenticated, useLogin, useLogout } from '@ginjou/vue'

const { data: authenticated, isLoading } = useAuthenticated()

const { mutateAsync: logout, isLoading: isLogoutLoading } = useLogout()
const { mutateAsync: login, isLoading: isLoginLoading } = useLogin()

async function handleLogoutClick() {
	logout(undefined)
}
async function handleLoginClick() {
	login(undefined)
}
</script>

<template>
	<template v-if="isLoading || authenticated == null">
		Check Auth ...
	</template>
	<template v-else-if="authenticated.authenticated === true">
		Hi! <br>
		<button
			:disabled="isLogoutLoading"
			@click="handleLogoutClick"
		>
			Logout {{ isLogoutLoading ? '...' : '' }}
		</button>
	</template>
	<template v-else-if="authenticated.authenticated === false">
		You are unauthenticated, Please Login first!<br>
		<button
			:disabled="isLoginLoading"
			@click="handleLoginClick"
		>
			Login {{ isLoginLoading ? '...' : '' }}
		</button>
	</template>
</template>

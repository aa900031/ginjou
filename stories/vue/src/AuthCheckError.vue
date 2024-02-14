<script setup lang="ts">
import { useAuthenticated, useCheckError, useLogin } from '@ginjou/vue'

const { data: authenticated, isLoading } = useAuthenticated()
const { mutateAsync: login, isLoading: isLoginLoading } = useLogin()
const { mutateAsync: checkError, isLoading: isCheckLoading } = useCheckError()

async function handleCheckClick() {
	const error = new Error('Auth')
	;(error as any).isAuthError = true
	await checkError(error)
}

async function handleLoginClick() {
	login({})
}

login({})
</script>

<template>
	<template v-if="authenticated == null || isLoading || isLoginLoading">
		Loading ...
	</template>
	<template v-else-if="authenticated?.authenticated">
		Check Auth Error
		<button @click="handleCheckClick">
			Trigger {{ isCheckLoading ? '...' : '' }}
		</button>
	</template>
	<template v-else-if="!authenticated?.authenticated">
		Please login again
		<button @click="handleLoginClick">
			Login
		</button>
	</template>
</template>

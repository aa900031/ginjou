<script setup lang="ts">
import { useGetIdentity, useLogin } from '@ginjou/vue'

const { mutateAsync: login } = useLogin()
const { data: identity, isLoading } = useGetIdentity<{ username: string }>()

login()
</script>

<template>
	<template v-if="identity == null || isLoading">
		Loading ...
	</template>
	<template v-else>
		Hi! {{ identity.username }}
	</template>
</template>

<script setup lang="ts">
import { useLogin, usePermissions } from '@ginjou/vue'

const { mutateAsync: login } = useLogin()
const { data: permissions, isLoading } = usePermissions<string[]>()

login()
</script>

<template>
	<template v-if="permissions == null || isLoading">
		Loading ...
	</template>
	<template v-else>
		Permissions: {{ permissions }}
	</template>
</template>

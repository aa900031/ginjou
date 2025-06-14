<script setup lang="ts">
const { mutate: login } = useLogin()
const { mutate: logout } = useLogout()
const { records } = await useAsyncList()
const { data: authenticated } = await useAsyncAuthenticated()
const isAuth = toRef(() => !!unref(authenticated)?.authenticated)

function handleLogout() {
	return logout({})
}
function handleLogin() {
	return login({})
}
</script>

<template>
	<ul>
		<li
			v-for="record in records"
			:key="record.id"
		>
			<NuxtLink :to="`/posts/${record.id}`">
				{{ record.name }}
			</NuxtLink>
		</li>
	</ul>
	<button
		v-if="isAuth"
		@click="handleLogout"
	>
		Logout
	</button>
	<button
		v-else
		@click="handleLogin"
	>
		Login
	</button>
</template>

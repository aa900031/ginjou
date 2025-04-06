<script setup lang="ts">
const { records, suspense } = useList()
const nuxtApp = useNuxtApp()

if (import.meta.server) {
	const instance = getCurrentInstance()

	const handler = async () => {
		await suspense()
	}

	if (instance)
		onServerPrefetch(handler)
	else
		nuxtApp.hook('app:created', handler)
}

await suspense()
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
</template>

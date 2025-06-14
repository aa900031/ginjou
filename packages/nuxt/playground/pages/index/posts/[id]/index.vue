<script setup lang="ts">
const { record } = await useAsyncShow()
const { data: authenticated } = await useAsyncAuthenticated()
if (!unref(authenticated)?.authenticated) {
	throw createError({
		status: 401,
	})
}
</script>

<template>
	<h1>Post #{{ record.id }}</h1>
	<pre>{{ record }}</pre>
	<NuxtLink :to="`/posts/${record.id}/edit`">
		Edit
	</NuxtLink>
</template>

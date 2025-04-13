<script setup lang="ts">
const { record } = await useAsyncShow()
</script>

<template>
	<h1>Post #{{ record.id }}</h1>
	<pre>{{ record }}</pre>
	<NuxtLink :to="`/posts/${record.id}/edit`">
		Edit
	</NuxtLink>
</template>

<script setup lang="ts">
definePageMeta({
	redirect: '/posts',
})
</script>

<template>
	<div>
		<NuxtLink to="/posts">
			Posts
		</NuxtLink>
		<NuxtLink to="/other">
			Other
		</NuxtLink>
	</div>
	<NuxtPage />
</template>

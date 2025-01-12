<script setup lang="ts">
const { records } = useList()
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

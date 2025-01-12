<script setup lang="ts">
const resource = ref('posts')
const id = ref('1')
const { record } = useGetOne({
	resource,
	id,
})
</script>

<template>
	<div>
		<label>Resource: </label>
		<input
			v-model="resource"
			type="radio"
			value="posts"
		>
		<label>Posts</label>

		<input
			v-model="resource"
			type="radio"
			value="users"
		>
		<label>Users</label>
	</div>
	<div>
		<label>ID: </label>
		<input v-model="id" type="text">
	</div>
	<pre>
		{{ record }}
	</pre>
</template>

<script setup lang="ts">
const { options } = await useAsyncSelect({
	resource: 'users',
	labelKey: 'name',
	valueKey: 'id',
})

const formData = reactive({
	user: unref(options)?.[0]?.value,
})
</script>

<template>
	<h1>Edit Post #</h1>
	<select v-model="formData.user">
		<option
			v-for="opt in options"
			:key="opt.value"
			:value="opt.value"
		>
			{{ opt.label }}
		</option>
	</select>
</template>

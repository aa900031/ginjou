<script setup lang="ts">
const { options } = await useAsyncSelect({
	resource: 'users',
	labelKey: 'name',
	valueKey: 'id',
})

const { record, save } = await useAsyncForm()

const formData = reactive({
	name: unref(record)?.name,
	user: unref(record)?.user ?? unref(options)?.[0]?.value,
})
</script>

<template>
	<h1>Edit Post #</h1>
	<form @submit.prevent="save">
		<div>
			<label for="">Name:</label><br>
			<input v-model="formData.name" type="text">
		</div>
		<div>
			<label for="">User:</label><br>
			<select v-model="formData.user">
				<option
					v-for="opt in options"
					:key="opt.value"
					:value="opt.value"
				>
					{{ opt.label }}
				</option>
			</select>
		</div>
		<br>
		<button type="submit">Submit</button>
	</form>
</template>

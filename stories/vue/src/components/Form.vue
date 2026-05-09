<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
	<form class="grid gap-3.5" v-bind="$attrs">
		<slot />
	</form>
</template>

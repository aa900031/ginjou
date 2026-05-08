<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
	<button
		class="w-fit cursor-pointer border-0 rounded-md bg-slate-900 text-white text-sm font-medium px-3.5 py-2 [transition:opacity_150ms_ease] hover:enabled:opacity-75 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-slate-100 dark:text-slate-900"
		v-bind="$attrs"
	>
		<slot />
	</button>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
	<th
		class="px-3.5 py-2.5 border-0 border-b border-solid border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400"
		v-bind="$attrs"
	>
		<slot />
	</th>
</template>

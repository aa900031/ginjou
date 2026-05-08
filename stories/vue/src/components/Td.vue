<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
	<td
		class="px-3.5 py-3 border-b border-slate-200 text-left text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300"
		v-bind="$attrs"
	>
		<slot />
	</td>
</template>

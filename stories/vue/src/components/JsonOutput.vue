<script setup lang="ts">
defineProps<{ value: any }>()
</script>

<template>
	<pre class="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-auto">{{ JSON.stringify(value ?? null, null, 2) }}</pre>
</template>

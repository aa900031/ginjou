<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
	<code class="block font-mono text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-md w-fit dark:text-slate-400 dark:bg-slate-700 wrap-anywhere">
		URL: {{ route.fullPath }}
	</code>
</template>

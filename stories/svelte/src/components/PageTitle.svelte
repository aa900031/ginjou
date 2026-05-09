<script lang="ts">
	import type { Snippet } from 'svelte'

	let { children }: { children?: Snippet } = $props()
</script>

<h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
	{@render children?.()}
</h1>

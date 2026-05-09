<script lang="ts">
	import type { Snippet } from 'svelte'

	let { children }: { children?: Snippet } = $props()
</script>

<label class="grid gap-1 text-sm font-medium text-slate-600 dark:text-slate-400">
	{@render children?.()}
</label>

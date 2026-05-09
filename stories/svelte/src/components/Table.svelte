<script lang="ts">
	import type { Snippet } from 'svelte'

	let { children }: { children?: Snippet } = $props()
</script>

<div class="rounded-xl overflow-hidden border border-solid border-slate-200 shadow dark:border-slate-700 dark:shadow-none">
	<table class="w-full bg-slate-50 dark:bg-slate-800" style="border-collapse: collapse">
		{@render children?.()}
	</table>
</div>

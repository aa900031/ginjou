<script lang="ts">
	import type { Snippet } from 'svelte'

	let { children, ...rest }: { children?: Snippet, [key: string]: unknown } = $props()
</script>

<td
	class="px-3.5 py-3 border-b border-slate-200 text-left text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300"
	{...rest}
>
	{@render children?.()}
</td>

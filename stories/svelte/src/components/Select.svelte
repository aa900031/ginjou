<script lang="ts">
	import type { Snippet } from 'svelte'

	let { value = $bindable(), children, ...rest }: { value?: unknown, children?: Snippet, [key: string]: unknown } = $props()
</script>

<select
	class="px-3 py-2 border border-solid border-slate-300 rounded-md bg-white text-sm text-slate-900 shadow-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
	bind:value
	{...rest}
>
	{@render children?.()}
</select>

<script lang="ts">
	import type { Snippet } from 'svelte'

	let { children, ...rest }: { children?: Snippet, [key: string]: unknown } = $props()
</script>

<form class="grid gap-3.5" {...rest}>
	{@render children?.()}
</form>

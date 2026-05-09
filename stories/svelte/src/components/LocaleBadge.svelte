<script lang="ts">
	import { useLocation } from '@ginjou/svelte'
	import { formatLocation } from '../utils/location'

	const locale = useLocation()
	const url = $derived(formatLocation(locale.value))
</script>

<code class="block font-mono text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-md w-fit dark:text-slate-400 dark:bg-slate-700 wrap-anywhere">
	URL: {url}
</code>

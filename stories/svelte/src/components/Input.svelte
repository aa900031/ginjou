<script lang="ts">
	let { value = $bindable(), ...rest }: { value?: unknown, [key: string]: unknown } = $props()
</script>

<input
	class="px-3 py-2 border border-solid border-slate-300 rounded-md bg-white text-sm text-slate-900 shadow-none appearance-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
	bind:value
	{...rest}
/>

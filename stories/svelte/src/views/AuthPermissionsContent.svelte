<script lang="ts">
	import { onMount } from 'svelte'
	import { useLogin, usePermissions } from '@ginjou/svelte'

	let ready = $state(false)

	const login = useLogin()
	const permissions = usePermissions<string[]>(() => ({
		queryOptions: {
			enabled: ready,
		},
	}))

	onMount(async () => {
		await login.mutateAsync()
		ready = true
	})
</script>

<div class="stack">
	<h1>usePermissions</h1>

	{#if !ready || login.isPending || permissions.isLoading || permissions.data == null}
		<div class="card">Loading ...</div>
	{:else}
		<div class="card">Permissions: {JSON.stringify(permissions.data)}</div>
	{/if}
</div>

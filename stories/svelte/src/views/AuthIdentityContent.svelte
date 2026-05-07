<script lang="ts">
	import { onMount } from 'svelte'
	import { useGetIdentity, useLogin } from '@ginjou/svelte'

	let ready = $state(false)

	const login = useLogin()
	const identity = useGetIdentity<{ username: string }>(() => ({
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
	<h1>useGetIdentity</h1>

	{#if !ready || login.isPending || identity.isLoading || identity.data == null}
		<div class="card">Loading ...</div>
	{:else}
		<div class="card">Hi! {identity.data.username}</div>
	{/if}
</div>

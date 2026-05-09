<script lang="ts">
	import { onMount } from 'svelte'
	import { useLogin, usePermissions } from '@ginjou/svelte'
	import Card from '../components/Card.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Stack from '../components/Stack.svelte'

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

<Stack>
	<PageTitle>usePermissions</PageTitle>

	{#if !ready || login.isPending || permissions.isLoading || permissions.data == null}
		<Card>Loading ...</Card>
	{:else}
		<Card>Permissions: {JSON.stringify(permissions.data)}</Card>
	{/if}
</Stack>

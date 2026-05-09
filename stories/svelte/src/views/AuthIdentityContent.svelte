<script lang="ts">
	import { onMount } from 'svelte'
	import { useGetIdentity, useLogin } from '@ginjou/svelte'
	import Card from '../components/Card.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Stack from '../components/Stack.svelte'

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

<Stack>
	<PageTitle>useGetIdentity</PageTitle>

	{#if !ready || login.isPending || identity.isLoading || identity.data == null}
		<Card>Loading ...</Card>
	{:else}
		<Card>Hi! {identity.data.username}</Card>
	{/if}
</Stack>

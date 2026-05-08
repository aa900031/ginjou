<script lang="ts">
	import { onMount } from 'svelte'
	import { useAuthenticated, useCheckError, useLogin } from '@ginjou/svelte'
	import Button from '../components/Button.svelte'
	import Card from '../components/Card.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Stack from '../components/Stack.svelte'

	const authenticated = useAuthenticated()
	const login = useLogin()
	const checkError = useCheckError<Error & { isAuthError?: boolean }>()

	onMount(async () => {
		await login.mutateAsync()
	})

	async function handleCheckClick(): Promise<void> {
		const error = new Error('Auth') as Error & { isAuthError?: boolean }
		error.isAuthError = true
		await checkError.mutateAsync(error)
	}

	async function handleLoginClick(): Promise<void> {
		await login.mutateAsync()
	}
</script>

<Stack>
	<PageTitle>useCheckError</PageTitle>

	{#if authenticated.data == null || authenticated.isLoading || login.isPending}
		<Card>Loading ...</Card>
	{:else if authenticated.data.authenticated}
		<Card>
			<Stack>
				<p>Check Auth Error</p>
				<Button type="button" onclick={handleCheckClick} disabled={checkError.isPending}>
					{checkError.isPending ? 'Trigger ...' : 'Trigger'}
				</Button>
			</Stack>
		</Card>
	{:else}
		<Card>
			<Stack>
				<p>Please login again</p>
				<Button type="button" onclick={handleLoginClick} disabled={login.isPending}>
					{login.isPending ? 'Login ...' : 'Login'}
				</Button>
			</Stack>
		</Card>
	{/if}
</Stack>

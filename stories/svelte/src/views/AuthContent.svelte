<script lang="ts">
	import { useAuthenticated, useLogin, useLogout } from '@ginjou/svelte'
	import Button from '../components/Button.svelte'
	import Card from '../components/Card.svelte'
	import PageTitle from '../components/PageTitle.svelte'
	import Stack from '../components/Stack.svelte'

	const authenticated = useAuthenticated()
	const login = useLogin()
	const logout = useLogout()

	async function handleLoginClick(): Promise<void> {
		await login.mutateAsync()
	}

	async function handleLogoutClick(): Promise<void> {
		await logout.mutateAsync()
	}
</script>

<Stack>
	<PageTitle>useAuthenticated / useLogin / useLogout</PageTitle>

	{#if authenticated.isLoading || authenticated.data == null}
		<Card>Check Auth ...</Card>
	{:else if authenticated.data.authenticated === true}
		<Card>
			<Stack>
				<p>Hi! You are authenticated.</p>
				<Button type="button" onclick={handleLogoutClick} disabled={logout.isPending}>
					{logout.isPending ? 'Logout...' : 'Logout'}
				</Button>
			</Stack>
		</Card>
	{:else}
		<Card>
			<Stack>
				<p>You are unauthenticated. Please login first.</p>
				<Button type="button" onclick={handleLoginClick} disabled={login.isPending}>
					{login.isPending ? 'Login...' : 'Login'}
				</Button>
			</Stack>
		</Card>
	{/if}
</Stack>

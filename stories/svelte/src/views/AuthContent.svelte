<script lang="ts">
	import { useAuthenticated, useLogin, useLogout } from '@ginjou/svelte'

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

<div class="stack">
	<h1>useAuthenticated / useLogin / useLogout</h1>

	{#if authenticated.isLoading || authenticated.data == null}
		<div class="card">Check Auth ...</div>
	{:else if authenticated.data.authenticated === true}
		<div class="card stack">
			<p>Hi! You are authenticated.</p>
			<button type="button" onclick={handleLogoutClick} disabled={logout.isPending}>
				{logout.isPending ? 'Logout...' : 'Logout'}
			</button>
		</div>
	{:else}
		<div class="card stack">
			<p>You are unauthenticated. Please login first.</p>
			<button type="button" onclick={handleLoginClick} disabled={login.isPending}>
				{login.isPending ? 'Login...' : 'Login'}
			</button>
		</div>
	{/if}
</div>

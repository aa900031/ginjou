<script lang="ts">
	import { onMount } from 'svelte'
	import { useAuthenticated, useCheckError, useLogin } from '@ginjou/svelte'

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

<div class="stack">
	<h1>useCheckError</h1>

	{#if authenticated.data == null || authenticated.isLoading || login.isPending}
		<div class="card">Loading ...</div>
	{:else if authenticated.data.authenticated}
		<div class="card stack">
			<p>Check Auth Error</p>
			<button type="button" onclick={handleCheckClick} disabled={checkError.isPending}>
				{checkError.isPending ? 'Trigger ...' : 'Trigger'}
			</button>
		</div>
	{:else}
		<div class="card stack">
			<p>Please login again</p>
			<button type="button" onclick={handleLoginClick} disabled={login.isPending}>
				{login.isPending ? 'Login ...' : 'Login'}
			</button>
		</div>
	{/if}
</div>

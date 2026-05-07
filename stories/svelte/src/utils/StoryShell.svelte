<script lang="ts">
	import type { Auth, Authz, I18n, ResourceDefinition } from '@ginjou/core'
	import type { QueryClientConfig } from '@tanstack/svelte-query'
	import { defineAuthContext, defineAuthzContext, defineFetchersContext, defineI18nContext, defineQueryClientContext, defineResourceContext, defineRouterContext } from '@ginjou/svelte'
	import { createFetcher } from '@ginjou/with-rest-api'
	import { createMockRouter } from './mock-router'
	import { API_BASE_URL, postResources } from './posts'
	import { resolveStoryAuth, resolveStoryAuthz, resolveStoryI18n } from './story-contexts'

	export let resources: ResourceDefinition[] = postResources
	export let withRouter = false
	export let initialPath = '/posts'
	export let auth: Auth | boolean | undefined = undefined
	export let authz: Authz | boolean | undefined = undefined
	export let i18n: I18n | boolean | undefined = undefined
	export let queryClientConfig: QueryClientConfig = {
		defaultOptions: {
			queries: {
				retry: false,
				refetchOnWindowFocus: false,
			},
			mutations: {
				retry: false,
			},
		},
	}

	defineFetchersContext({
		default: createFetcher({
			url: API_BASE_URL,
		}),
	})
	defineQueryClientContext(queryClientConfig)
	defineResourceContext({
		resources,
	})

	const authContext = resolveStoryAuth(auth)
	if (authContext)
		defineAuthContext(authContext)

	const authzContext = resolveStoryAuthz(authz)
	if (authzContext)
		defineAuthzContext(authzContext)

	const i18nContext = resolveStoryI18n(i18n)
	if (i18nContext)
		defineI18nContext(i18nContext)

	if (withRouter)
		defineRouterContext(createMockRouter(initialPath))
</script>

<div class="story-shell">
	<slot />
</div>

<style>
	.story-shell {
		min-height: 100%;
		padding: 1.25rem;
		color: #0f172a;
		font-family: "SF Pro Text", "Segoe UI", sans-serif;
		background:
			radial-gradient(circle at top left, rgba(125, 211, 252, 0.18), transparent 28%),
			radial-gradient(circle at top right, rgba(134, 239, 172, 0.16), transparent 28%),
			#f8fafc;
	}

	.story-shell :global(h1) {
		margin: 0 0 1rem;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.story-shell :global(code) {
		display: block;
		margin-bottom: 1rem;
		color: #475569;
		font-size: 0.875rem;
	}

	.story-shell :global(table) {
		width: 100%;
		border-collapse: collapse;
		background: rgba(255, 255, 255, 0.88);
		backdrop-filter: blur(12px);
		border-radius: 0.875rem;
		overflow: hidden;
		box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
	}

	.story-shell :global(th),
	.story-shell :global(td) {
		padding: 0.75rem 0.875rem;
		border-bottom: 1px solid rgba(148, 163, 184, 0.18);
		text-align: left;
		font-size: 0.9375rem;
	}

	.story-shell :global(th) {
		color: #334155;
		font-weight: 600;
		background: rgba(241, 245, 249, 0.9);
	}

	.story-shell :global(form),
	.story-shell :global(.controls),
	.story-shell :global(.meta-row) {
		display: grid;
		gap: 0.875rem;
	}

	.story-shell :global(label) {
		display: grid;
		gap: 0.375rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: #334155;
	}

	.story-shell :global(input),
	.story-shell :global(select),
	.story-shell :global(button) {
		font: inherit;
	}

	.story-shell :global(input),
	.story-shell :global(select) {
		padding: 0.625rem 0.75rem;
		border: 1px solid rgba(148, 163, 184, 0.4);
		border-radius: 0.75rem;
		background: rgba(255, 255, 255, 0.92);
	}

	.story-shell :global(button) {
		width: fit-content;
		padding: 0.625rem 0.95rem;
		border: 0;
		border-radius: 999px;
		background: #0f172a;
		color: #f8fafc;
		cursor: pointer;
		transition: transform 120ms ease, opacity 120ms ease;
	}

	.story-shell :global(button:hover:not(:disabled)) {
		transform: translateY(-1px);
	}

	.story-shell :global(button:disabled) {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.story-shell :global(pre) {
		padding: 0.875rem;
		border-radius: 0.875rem;
		background: #0f172a;
		color: #e2e8f0;
		font-size: 0.8125rem;
		overflow: auto;
	}

	.story-shell :global(.stack) {
		display: grid;
		gap: 1rem;
	}

	.story-shell :global(.inline-actions) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
	}

	.story-shell :global(.card) {
		padding: 1rem;
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.88);
		box-shadow: 0 10px 32px rgba(15, 23, 42, 0.08);
	}
</style>

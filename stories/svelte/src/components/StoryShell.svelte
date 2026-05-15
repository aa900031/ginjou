<script lang="ts">
	import type { Snippet } from "svelte"
	import type { Auth, Authz, I18n, Resource } from '@ginjou/core'
	import type { QueryClientConfig } from '@tanstack/svelte-query'
	import { defineAuthContext, defineAuthzContext, defineFetchersContext, defineI18nContext, defineQueryClientContext, defineControllerContext, defineRouterContext } from '@ginjou/svelte'
	import { createRouter } from '@ginjou/with-svelte-spa-router'
	import { createFetcher } from '@ginjou/with-rest-api'
	import Router from 'svelte-spa-router'
	import { API_BASE_URL, postResources } from '@ginjou/storybook-shared/mock-data'
	import { resolveStoryAuth, resolveStoryAuthz, resolveStoryI18n } from '../utils/story-contexts'

	const {
		resources = postResources,
		initialPath,
		routes,
		auth,
		authz,
		i18n,
		queryClientConfig = {
			defaultOptions: {
				queries: {
					retry: false,
					refetchOnWindowFocus: false,
				},
				mutations: {
					retry: false,
				},
			},
		},
		children,
	}: {
		resources?: Resource.Raw[]
		routes?: Record<string, any> | undefined
		initialPath?: string
		auth?: Auth | boolean | undefined
		authz?: Authz | boolean | undefined
		i18n?: I18n | boolean | undefined
		queryClientConfig?: QueryClientConfig
		children?: Snippet
	} = $props()

	defineFetchersContext({
		default: createFetcher({
			url: API_BASE_URL,
		}),
	})
	defineQueryClientContext(queryClientConfig)
	defineControllerContext({
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

	if (routes) {
		window.location.hash = `#${(initialPath ?? '/').startsWith('/') ? initialPath : `/${initialPath}`}`
		defineRouterContext(createRouter())
	}
</script>

<div class="story-shell min-h-full text-slate-900 dark:text-slate-100">
	{#if routes}
		<Router {routes} />
	{:else}
		{@render children?.()}
	{/if}
</div>

<style>
	.story-shell {
		font-family: "SF Pro Text", "Segoe UI", sans-serif;
	}
</style>

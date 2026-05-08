<script lang="ts">
	import type { Auth, Authz, I18n, ResourceDefinition } from '@ginjou/core'
	import type { QueryClientConfig } from '@tanstack/svelte-query'
	import { defineAuthContext, defineAuthzContext, defineFetchersContext, defineI18nContext, defineQueryClientContext, defineResourceContext, defineRouterContext } from '@ginjou/svelte'
	import { createFetcher } from '@ginjou/with-rest-api'
	import { createMockRouter } from '../utils/mock-router'
	import { API_BASE_URL, postResources } from '../utils/posts'
	import { resolveStoryAuth, resolveStoryAuthz, resolveStoryI18n } from '../utils/story-contexts'

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

<div class="story-shell min-h-full text-slate-900 dark:text-slate-100">
	<slot />
</div>

<style>
	.story-shell {
		font-family: "SF Pro Text", "Segoe UI", sans-serif;
	}
</style>

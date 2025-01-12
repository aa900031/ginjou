import type { DehydratedState, VueQueryPluginOptions } from '@tanstack/vue-query'
import GinjouAccess from '#build/ginjou-access'
import GinjouAuth from '#build/ginjou-auth'
import GinjouFetcher from '#build/ginjou-fetcher'
import GinjouI18n from '#build/ginjou-i18n'
import GinjouNotification from '#build/ginjou-notification'
import GinjouQuery from '#build/ginjou-query'
import GinjouRealtime from '#build/ginjou-realtime'
import GinjouResource from '#build/ginjou-resource'
import GinjouRouter from '#build/ginjou-router'
import { defineNuxtPlugin, useState } from '#imports'
import VuePlugin from '@ginjou/vue/plugin'
import { dehydrate, hydrate, QueryClient } from '@tanstack/vue-query'

export default defineNuxtPlugin({
	setup: (nuxt) => {
		const queryState = useState<DehydratedState | null>('ginjou-query-key')
		const queryClient = getQueryClient(GinjouQuery as any)

		nuxt.vueApp.use(VuePlugin, {
			query: GinjouQuery,
			router: GinjouRouter,
			i18n: GinjouI18n,
			resource: GinjouResource,
			auth: GinjouAuth,
			access: GinjouAccess,
			fetcher: GinjouFetcher,
			realtime: GinjouRealtime,
			notification: GinjouNotification,
		} as any)

		if (import.meta.server) {
			nuxt.hooks.hook('app:rendered', () => {
				queryState.value = dehydrate(queryClient)
			})
		}

		if (import.meta.client)
			hydrate(queryClient, queryState.value)
	},
})

function getQueryClient(
	options: VueQueryPluginOptions,
): QueryClient {
	const client = 'queryClient' in options && options.queryClient != null
		? options.queryClient
		: new QueryClient('queryClientConfig' in options ? options.queryClientConfig : undefined)

	;(options as any).queryClient = client

	return client
}

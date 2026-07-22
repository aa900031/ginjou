import type { DehydratedState } from '@tanstack/vue-query'
// Ignore TS2742 errors.
// eslint-disable-next-line unused-imports/no-unused-imports
import type { ObjectPlugin } from '#app'
import { getQueryClients, setQueryClientDehydrateState } from '@ginjou/vue'
import { dehydrate } from '@tanstack/vue-query'
import { defineNuxtPlugin, useState } from '#imports'

export default defineNuxtPlugin({
	name: 'ginjou/query-hydrate-plugin',
	setup: (nuxt) => {
		const dehydratedStateMap = useState<Record<string, DehydratedState> | null>('ginjou-query/dehydrated-state-map')

		if (import.meta.server) {
			nuxt.hooks.hook('app:rendered', () => {
				const clients = getQueryClients(nuxt.vueApp)
				dehydratedStateMap.value = Object.fromEntries(
					[...clients].map(([key, client]) => [key, dehydrate(client)]),
				)
			})
		}

		if (import.meta.client && dehydratedStateMap.value != null) {
			for (const [key, value] of Object.entries(dehydratedStateMap.value)) {
				setQueryClientDehydrateState(nuxt.vueApp, key, value)
			}
		}
	},
})

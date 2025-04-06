import type { DehydratedState } from '@tanstack/vue-query'
import { defineNuxtPlugin, useState } from '#imports'
import { getQueryClients, setQueryClientDehydrateState } from '@ginjou/vue'
import { dehydrate } from '@tanstack/vue-query'

export default defineNuxtPlugin({
	name: 'ginjou/query-hydrate-plugin',
	setup: (nuxt) => {
		const dehydratedStateMap = useState<Record<string, DehydratedState> | null>('ginjou-query/dehydrated-state-map')

		if (import.meta.server) {
			nuxt.hooks.hook('app:rendered', () => {
				const clients = getQueryClients()

				dehydratedStateMap.value = Object.fromEntries(
					[...clients].map(([key, client]) => [key, dehydrate(client)]),
				)
			})
		}

		if (import.meta.client && dehydratedStateMap.value != null) {
			for (const [key, value] of Object.entries(dehydratedStateMap.value)) {
				setQueryClientDehydrateState(key, value)
			}
		}
	},
})

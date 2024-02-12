import { getCurrentInstance, provide } from 'vue'
import type { Fetchers, ResourceDefinition } from '@ginjou/core'
import { defineFetchers, defineResourceContext, defineRouterContext } from '@ginjou/vue'
import { defineRouterBinding } from '@ginjou/with-vue-router'
import { createFetcher } from '@ginjou/with-rest-api'
import { QueryClient } from '@tanstack/vue-query'
import type { Decorator } from '@storybook/vue3'

export type CreateWrapperProps =
	& {
		router?: boolean
		fetchers?: Fetchers
		resources?: ResourceDefinition[]
		queryClient?: QueryClient
	}

export function createWrapper(
	props?: CreateWrapperProps,
): Decorator {
	const inited = new WeakSet()

	const resolved = {
		fetchers: props?.fetchers ?? createFetchers(),
		queryClient: props?.queryClient ?? new QueryClient(),
		resources: props?.resources,
		router: props?.router ?? false,
	} as const

	return story => ({
		name: 'GinjouWrapper',
		components: { story },
		setup: () => {
			const { app } = getCurrentInstance()!.appContext
			if (inited.has(app))
				return

			for (const [key, value] of Object.entries(resolved)) {
				switch (key) {
					case 'queryClient':
						provide('VUE_QUERY_CLIENT', value)
						break
					case 'fetchers':
						defineFetchers(value as any)
						break
					case 'resources':
						defineResourceContext({
							resources: value as any,
						})
						break
					case 'router':
						value && defineRouterContext(
							defineRouterBinding(),
						)
						break
				}
			}

			inited.add(app)
		},
		template: '<story />',
	})
}

function createFetchers(): Fetchers {
	return {
		default: createFetcher({
			url: 'https://rest-api.local',
		}),
	}
}

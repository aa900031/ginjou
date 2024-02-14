import { delay } from 'msw'
import { getCurrentInstance, provide } from 'vue'
import type { Auth, Fetchers, ResourceDefinition } from '@ginjou/core'
import { defineAuthContext, defineFetchers, defineResourceContext, defineRouterContext } from '@ginjou/vue'
import { createRouterBinding } from '@ginjou/with-vue-router'
import { createFetcher } from '@ginjou/with-rest-api'
import { QueryClient } from '@tanstack/vue-query'
import type { Decorator } from '@storybook/vue3'

export type CreateWrapperProps =
	& {
		router?: boolean
		fetchers?: Fetchers
		resources?: ResourceDefinition[]
		auth?: Auth | boolean
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
		auth: props?.auth === true
			? createAuth()
			: props?.auth === false
				? undefined
				: props?.auth,
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
							createRouterBinding(),
						)
						break
					case 'auth':
						value && defineAuthContext(value as Auth)
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

function createAuth(): Auth {
	return {
		login: async () => {
			await delay(500)
			;(window as any).__AUTH = 'user001'
		},
		logout: async () => {
			await delay(500)
			;(window as any).__AUTH = undefined
		},
		check: async () => {
			await delay(500)
			return {
				authenticated: (window as any).__AUTH != null,
				logout: (window as any).__AUTH == null,
			}
		},
		checkError: async () => ({}),
		getIdentity: async () => {
			if ((window as any).__AUTH) {
				return {
					username: (window as any).__AUTH,
				}
			}
			else {
				return null
			}
		},
		getPermissions: async () => {
			if ((window as any).__AUTH)
				return ['admin']
			else
				return null
		},
	}
}

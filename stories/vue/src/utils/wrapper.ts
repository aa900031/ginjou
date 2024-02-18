import { delay } from 'msw'
import { getCurrentInstance, provide } from 'vue'
import type { Auth, Fetchers, I18n, ResourceDefinition } from '@ginjou/core'
import { defineAuthContext, defineFetchers, defineI18nContext, defineResourceContext, defineRouterContext } from '@ginjou/vue'
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
		i18n?: I18n | boolean
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
		i18n: props?.i18n === true
			? createI18n()
			: props?.i18n === false
				? undefined
				: props?.i18n,
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
					case 'i18n':
						value && defineI18nContext(value as I18n)
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
		checkError: async (error) => {
			if (error && (error as any).isAuthError) {
				return {
					logout: true,
					error,
				}
			}
			return {}
		},
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

function createI18n(): I18n {
	let locale = 'en-US'
	const messages: Record<string, Record<string, string>> = {
		'en-US': {
			hi: 'Hi',
			ya: 'Ya',
			msg: 'Hello $name',
		},
		'zh-TW': {
			hi: '嗨',
			ya: '耶',
			msg: '你好 $name',
		},
	}
	const subscribes = new Set<(value: string) => void>()

	return {
		translate: (key, params) => {
			const raw = messages[locale][key as any]
			if (!raw)
				return key

			let result = raw
			for (const [key, value] of Object.entries(params ?? {}))
				result = raw.replace(`$${key}`, value)

			return result
		},
		getLocale: () => {
			return locale
		},
		setLocale: (value) => {
			locale = value

			for (const handler of subscribes)
				handler(locale)
		},
		onChangeLocale: (handler) => {
			subscribes.add(handler)
			return () => subscribes.delete(handler)
		},
	}
}

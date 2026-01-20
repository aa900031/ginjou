import type { Auth, Authz, Fetchers, I18n, Notification, ResourceDefinition } from '@ginjou/core'
import type { Decorator } from '@storybook/vue3'
import type { QueryClient } from '@tanstack/vue-query'
import { defineAuth, defineAuthz, defineI18n, NotificationType } from '@ginjou/core'
import { defineAuthContext, defineAuthzContext, defineFetchersContext, defineI18nContext, defineNotificationContext, defineQueryClientContext, defineResourceContext, defineRouterContext } from '@ginjou/vue'
import { createFetcher } from '@ginjou/with-rest-api'
import { createRouter } from '@ginjou/with-vue-router'
import { delay } from 'msw'
import { ToastClose, ToastDescription, ToastProvider, ToastRoot, ToastTitle, ToastViewport } from 'reka-ui'
import { defineToast, useToast } from './reka-toast'

export type CreateWrapperProps
	= & {
		router?: boolean
		fetchers?: Fetchers
		resources?: ResourceDefinition[]
		auth?: Auth | boolean
		authz?: Authz | boolean
		i18n?: I18n | boolean
		queryClient?: QueryClient
		notification?: Notification | boolean
	}

export function createWrapper(
	props?: CreateWrapperProps,
): Decorator {
	const resolved = {
		fetchers: props?.fetchers ?? createFetchers,
		queryClient: props?.queryClient,
		resources: props?.resources,
		auth: props?.auth === true
			? createAuth
			: props?.auth === false
				? undefined
				: props?.auth,
		authz: props?.authz === true
			? createAuthz
			: props?.authz === false
				? undefined
				: props?.authz,
		i18n: props?.i18n === true
			? createI18n
			: props?.i18n === false
				? undefined
				: props?.i18n,
		router: props?.router ?? false,
		notification: props?.notification === true
			? createNotification
			: props?.notification === false
				? undefined
				: props?.notification,
	} as const

	return story => ({
		name: 'GinjouWrapper',
		components: { story, ToastRoot, ToastTitle, ToastDescription, ToastViewport, ToastClose, ToastProvider },
		setup: () => {
			const { toasts, remove } = defineToast()

			for (const [key, value] of Object.entries(resolved)) {
				switch (key) {
					case 'queryClient':
						defineQueryClientContext(value as any)
						break
					case 'fetchers':
						defineFetchersContext((typeof value === 'function' ? value() : value) as any)
						break
					case 'resources':
						value && defineResourceContext({
							resources: value as any,
						})
						break
					case 'router':
						value && defineRouterContext(
							createRouter(),
						)
						break
					case 'auth':
						value && defineAuthContext((typeof value === 'function' ? value() : value) as any)
						break
					case 'authz':
						value && defineAuthzContext((typeof value === 'function' ? value() : value) as any)
						break
					case 'i18n':
						value && defineI18nContext((typeof value === 'function' ? value() : value) as any)
						break
					case 'notification':
						value && defineNotificationContext((typeof value === 'function' ? value() : value) as any)
						break
				}
			}

			return {
				toasts,
				remove,
			}
		},
		template: `
			<story />
			<ToastProvider>
				<ToastViewport
					style="position: fixed; top: 1rem; right: 1rem; z-index: 9999; display: flex; flex-direction: column; gap: 0.5rem;"
				>
					<ToastRoot
						v-for="toast in toasts"
						:key="toast.id"
						:open="true"
						@update:open="(isOpen) => !isOpen && remove(toast.id)"
						:style="{
							padding: '1rem',
							borderRadius: '6px',
							color: '#fff',
							fontFamily: '-apple-system, BlinkMacSystemFont, \\'Segoe UI\\', Roboto, Helvetica, Arial, sans-serif, \\'Apple Color Emoji\\', \\'Segoe UI Emoji\\', \\'Segoe UI Symbol\\'',
							fontSize: '0.875rem',
							boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
							backgroundColor: toast.severity === 'success' ? '#22c55e' : toast.severity === 'error' ? '#ef4444' : '#64748b',
						}"
					>
						<ToastTitle v-if="toast.title" style="font-weight: 600;">
							{{ toast.title }}
						</ToastTitle>
						<ToastDescription v-if="toast.description" style="margin-top: 0.25rem;">
							{{ toast.description }}
						</ToastDescription>
						<ToastClose style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none; color: inherit; cursor: pointer;">
							X
						</ToastClose>
					</ToastRoot>
				</ToastViewport>
			</ToastProvider>
		`,
	})
}

function createFetchers(): Fetchers {
	return {
		default: createFetcher({
			url: 'https://rest-api.local',
		}),
	}
}

// eslint-disable-next-line ts/explicit-function-return-type
function createAuth() {
	return defineAuth({
		login: async () => {
			await delay(500)
			;(window as any).__AUTH = 'user001'

			return {}
		},
		logout: async () => {
			await delay(500)
			;(window as any).__AUTH = undefined

			return {}
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
			return null
		},
	})
}

// eslint-disable-next-line ts/explicit-function-return-type
function createAuthz() {
	return defineAuthz({
		getPermissions: async () => {
			if ((window as any).__AUTH)
				return ['admin']
			else
				return null
		},
	})
}

// eslint-disable-next-line ts/explicit-function-return-type
function createI18n() {
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

	return defineI18n({
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
	})
}

function createNotification(): Notification {
	const toast = useToast()
	const removeFnMap = new Map<string, () => void>()

	return {
		open: (params) => {
			let id: string | undefined
			switch (params.type) {
				case NotificationType.Success:
				case NotificationType.Error: {
					id = toast.show({
						severity: params.type,
						title: params.message,
						description: params.description,
					})
					break
				}
				case NotificationType.Progress: {
					id = toast.show({
						severity: 'secondary',
						title: params.message,
						description: params.description,
					})
					// Reka UI's provider controls duration, can't set per-toast timeout easily here.
					// The onFinish/onCancel logic is also not directly supported by this simple wrapper.
					break
				}
				default:
					break
			}
			if (id && params.key) {
				removeFnMap.set(params.key, () => toast.remove(id!))
			}
		},
		close: (key) => {
			removeFnMap.get(key)?.()
			removeFnMap.delete(key)
		},
	}
}

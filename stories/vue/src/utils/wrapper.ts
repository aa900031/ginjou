import type { Auth, Authz, Fetchers, I18n, Notification, ResourceDefinition } from '@ginjou/core'
import type { Decorator } from '@storybook/vue3'
import type { QueryClient } from '@tanstack/vue-query'
import type { ToastMessageOptions } from 'primevue/toast'
import { NotificationType } from '@ginjou/core'
import { defineAuthContext, defineAuthzContext, defineFetchers, defineI18nContext, defineNotificationContext, defineQueryClientContext, defineResourceContext, defineRouterContext } from '@ginjou/vue'
import { createFetcher } from '@ginjou/with-rest-api'
import { createRouterBinding } from '@ginjou/with-vue-router'
import { delay } from 'msw'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

export type CreateWrapperProps =
	& {
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
		components: { story, Toast },
		setup: () => {
			for (const [key, value] of Object.entries(resolved)) {
				switch (key) {
					case 'queryClient':
						defineQueryClientContext(value as any)
						break
					case 'fetchers':
						defineFetchers((typeof value === 'function' ? value() : value) as any)
						break
					case 'resources':
						value && defineResourceContext({
							resources: value as any,
						})
						break
					case 'router':
						value && defineRouterContext(
							createRouterBinding(),
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

			function handleToastClose({ message }: { message: ToastMessageOptions }) {
				if ('_onCancel' in message && typeof message._onCancel === 'function')
					message._onCancel()
			}

			function handleToastLifeEnd({ message }: { message: ToastMessageOptions }) {
				if ('_onFinish' in message && typeof message._onFinish === 'function')
					message._onFinish()
			}

			return {
				handleToastClose,
				handleToastLifeEnd,
			}
		},
		template: `
			<story />
			<Toast
				@close="handleToastClose"
				@life-end="handleToastLifeEnd"
			/>
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
	}
}

function createAuthz() {
	return {
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

function createNotification(): Notification {
	const toast = useToast()
	const removeFnMap = new Map<string, () => void>()

	return {
		open: (params) => {
			switch (params.type) {
				case NotificationType.Success:
				case NotificationType.Error: {
					const opt: ToastMessageOptions = {
						severity: params.type,
						summary: params.message,
						detail: params.description,
						life: 3000,
						...{
							onFinish: () => {
								params.key
								&& removeFnMap.delete(params.key)
							},
							_onCancel: () => {
								params.key
								&& removeFnMap.delete(params.key)
							},
						},
					}
					toast.add(opt)
					params.key
					&& removeFnMap.set(params.key, () => toast.remove(opt))

					break
				}
				case NotificationType.Progress: {
					const opt: ToastMessageOptions = {
						severity: 'secondary',
						summary: params.message,
						detail: params.description,
						life: params.timeout,
						...{
							_onFinish: () => {
								params.key
								&& removeFnMap.delete(params.key)
								params.onFinish()
							},
							_onCancel: async () => {
								params.key
								&& removeFnMap.delete(params.key)
								params.onCancel()
							},
						} as any,
					}
					toast.add(opt)

					params.key
					&& removeFnMap.set(params.key, () => toast.remove(opt))

					break
				}
				default:
					break
			}
		},
		close: (key) => {
			removeFnMap.get(key)?.()
		},
	}
}

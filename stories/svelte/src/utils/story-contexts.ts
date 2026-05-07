import type { Auth, Authz, I18n } from '@ginjou/core'
import { defineAuth, defineAuthz, defineI18n } from '@ginjou/core'
import { delay } from 'msw'

let currentUser: string | undefined

export function resolveStoryAuth(value: Auth | boolean | undefined): Auth | undefined {
	if (value === true)
		return createAuth()

	if (value && value !== false)
		return value

	return undefined
}

export function resolveStoryI18n(value: I18n | boolean | undefined): I18n | undefined {
	if (value === true)
		return createI18n()

	if (value && value !== false)
		return value

	return undefined
}

export function resolveStoryAuthz(value: Authz | boolean | undefined): Authz | undefined {
	if (value === true)
		return createAuthz()

	if (value && value !== false)
		return value

	return undefined
}

function createAuth(): Auth {
	currentUser = undefined

	return defineAuth({
		login: async () => {
			await delay(300)
			currentUser = 'user001'

			return {}
		},
		logout: async () => {
			await delay(300)
			currentUser = undefined

			return {}
		},
		check: async () => {
			await delay(300)

			return {
				authenticated: currentUser != null,
				logout: currentUser == null,
			}
		},
		checkError: async (error) => {
			if (error && (error as { isAuthError?: boolean }).isAuthError) {
				return {
					logout: true,
					error,
				}
			}

			return {}
		},
		getIdentity: async () => {
			await delay(150)

			if (currentUser) {
				return {
					username: currentUser,
				}
			}

			return null
		},
	})
}

function createAuthz(): Authz {
	return defineAuthz({
		getPermissions: async () => {
			await delay(150)

			if (currentUser)
				return ['admin']

			return null
		},
	})
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
	const subscribers = new Set<(value: string) => void>()

	return defineI18n({
		translate: (key, params) => {
			const raw = messages[locale]?.[key as string]
			if (!raw)
				return key

			let result = raw
			for (const [paramKey, value] of Object.entries(params ?? {}))
				result = result.replace(`$${paramKey}`, value)

			return result
		},
		getLocale: () => {
			return locale
		},
		setLocale: (value) => {
			locale = value

			for (const subscriber of subscribers)
				subscriber(locale)
		},
		onChangeLocale: (handler) => {
			subscribers.add(handler)
			return () => subscribers.delete(handler)
		},
	})
}

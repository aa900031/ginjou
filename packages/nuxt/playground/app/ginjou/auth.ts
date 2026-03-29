import { defineAuthContext } from '@ginjou/vue'

// eslint-disable-next-line ts/explicit-function-return-type
export default () => defineAuthContext({
	login: async (params: any) => {
		const headers = useRequestHeaders()

		await $fetch('/api/auth/login', {
			method: 'POST',
			body: params,
			headers,
		})
		return {}
	},
	logout: async () => {
		const headers = useRequestHeaders()

		await $fetch('/api/auth/logout', {
			method: 'POST',
			headers,
		})
		return {
			redirectTo: '/login',
		}
	},
	getIdentity: async () => {
		const headers = useRequestHeaders()
		try {
			return await $fetch('/api/auth/me', {
				headers,
			})
		}
		catch {
			return null
		}
	},
	check: async () => {
		const headers = useRequestHeaders()
		try {
			await $fetch('/api/auth/me', {
				headers,
			})
			return { authenticated: true }
		}
		catch {
			return { authenticated: false }
		}
	},
	checkError: async () => ({
		logout: true,
	}),
})

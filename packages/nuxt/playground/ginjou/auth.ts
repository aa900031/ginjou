import { defineAuthContext } from '@ginjou/vue'

export default () => defineAuthContext({
	login: async () => {
		;(globalThis as any)._AUTH = {
			name: 'foo',
		}
		return {
			redirectTo: false,
		}
	},
	logout: async () => {
		delete (globalThis as any)._AUTH
		return {
			redirectTo: false,
		}
	},
	getIdentity: () => {
		return (globalThis as any)._AUTH
	},
	check: async () => {
		return {
			authenticated: !!(globalThis as any)._AUTH,
		}
	},
	checkError: async () => ({
		logout: true,
	}),
})

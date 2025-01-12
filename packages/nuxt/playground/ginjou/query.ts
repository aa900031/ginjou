import type { VueQueryPluginOptions } from '@tanstack/vue-query'

export default {
	queryClientConfig: {
		defaultOptions: {
			queries: {
				staleTime: 5 * 60 * 1000,
			},
		},
	},
} satisfies VueQueryPluginOptions

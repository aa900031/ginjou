import { addImports, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import ImportListForAsync from './imports/async'
import ImportListForGinjou from './imports/ginjou'
import ImportListForTanstackQuery from './imports/tanstack-query'

export interface Options {
	router?: boolean
}

export default defineNuxtModule({
	meta: {
		name: 'ginjou',
		configKey: 'ginjou',
	},
	defaults: {
		router: true,
	},
	setup: async (options, nuxt) => {
		const { resolve } = createResolver(import.meta.url)

		nuxt.hook('vite:extend', ({ config }) => {
			config.optimizeDeps ??= {}
			config.optimizeDeps.include ??= []
			config.optimizeDeps.include.push(
				'@ginjou/core',
				'@ginjou/vue',
				'@ginjou/with-vue-router',
				'@ginjou/with-vue-i18n',
			)
		})

		addImports(ImportListForTanstackQuery)
		addImports(ImportListForGinjou)
		addImports(ImportListForAsync(resolve))
		addPlugin(resolve('./runtime/query-hydrate-plugin'))

		if (options.router)
			addPlugin(resolve('./runtime/router-plugin'))
	},
})

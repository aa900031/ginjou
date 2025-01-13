import { addImports, addPlugin, addTemplate, createResolver, defineNuxtModule, updateTemplates } from '@nuxt/kit'
import ImportListForGinjou from './imports/ginjou'
import ImportListForTanstackQuery from './imports/query'
import { createConfigTemplate } from './templates/config'
import { createRouterTemplate } from './templates/router'

export interface Options {
	query?: string
	router?: boolean | string
	i18n?: string
	resource?: string
	auth?: string
	access?: string
	fetcher?: string
	realtime?: string
	notification?: string
}

export default defineNuxtModule<
	Options
>({
	meta: {
		name: 'ginjou',
		configKey: 'ginjou',
	},
	defaults: {
		query: 'ginjou/query.ts',
		router: 'ginjou/router.ts',
		i18n: 'ginjou/i18n.ts',
		resource: 'ginjou/resource.ts',
		auth: 'ginjou/auth.ts',
		access: 'ginjou/access.ts',
		fetcher: 'ginjou/fetcher.ts',
		realtime: 'ginjou/realtime.ts',
		notification: 'ginjou/notification.ts',
	},
	setup: async (options, nuxt) => {
		const { resolve } = createResolver(import.meta.url)

		const templates = [
			createRouterTemplate({
				nuxt,
				resolve,
				options,
			}),
			createConfigTemplate({
				key: 'query',
				filename: 'ginjou-query.ts',
				nuxt,
				resolve,
				options,
			}),
			createConfigTemplate({
				key: 'i18n',
				filename: 'ginjou-i18n.ts',
				nuxt,
				resolve,
				options,
			}),
			createConfigTemplate({
				key: 'resource',
				filename: 'ginjou-resource.ts',
				nuxt,
				resolve,
				options,
			}),
			createConfigTemplate({
				key: 'auth',
				filename: 'ginjou-auth.ts',
				nuxt,
				resolve,
				options,
			}),
			createConfigTemplate({
				key: 'access',
				filename: 'ginjou-access.ts',
				nuxt,
				resolve,
				options,
			}),
			createConfigTemplate({
				key: 'fetcher',
				filename: 'ginjou-fetcher.ts',
				nuxt,
				resolve,
				options,
			}),
			createConfigTemplate({
				key: 'realtime',
				filename: 'ginjou-realtime.ts',
				nuxt,
				resolve,
				options,
			}),
			createConfigTemplate({
				key: 'notification',
				filename: 'ginjou-notification.ts',
				nuxt,
				resolve,
				options,
			}),
		]

		for (const { template } of templates) {
			addTemplate(template)
		}

		nuxt.hook('builder:watch', async (event, relativePath) => {
			if (!['add', 'unlink', 'change'].includes(event)) {
				return
			}

			const path = resolve(nuxt.options.srcDir, relativePath)
			const target = templates.find(item => item.paths?.src === path)
			if (!target)
				return

			await updateTemplates({
				filter: template => template.filename === target.template.filename,
			})

			await nuxt.hooks.callHook('restart', { hard: true })
		})

		nuxt.hook('vite:extend', ({ config }) => {
			config.optimizeDeps ??= {}
			config.optimizeDeps.exclude ??= []
			config.optimizeDeps.exclude.push(...[
				'@ginjou/core',
				'@ginjou/vue',
				'@ginjou/with-vue-router',
				'@ginjou/with-vue-i18n',
			])
		})

		addImports(ImportListForTanstackQuery)
		addImports(ImportListForGinjou)

		addPlugin(resolve('./runtime/plugin'))
	},
})

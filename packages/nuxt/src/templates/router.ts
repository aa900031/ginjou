import type { Resolver } from '@nuxt/kit'
import type { Nuxt, NuxtTemplate } from '@nuxt/schema'
import type { Options } from '../module'
import { createConfigTemplate } from './config'

export function createRouterTemplate(
	props: {
		nuxt: Nuxt
		resolve: Resolver['resolve']
		options: Options
	},
) {
	return createConfigTemplate({
		...props,
		key: 'router',
		filename: 'ginjou-router.ts',
		fallback: `
		import { createRouterBinding } from '@ginjou/with-vue-router'
		export default createRouterBinding
		`,
	})
}

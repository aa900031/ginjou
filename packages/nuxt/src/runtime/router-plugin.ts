// Ignore TS2742 errors.
// eslint-disable-next-line unused-imports/no-unused-imports
import type { ObjectPlugin } from '#app'
import { defineRouterContext } from '@ginjou/vue'
import { createRouter } from '@ginjou/with-vue-router'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin({
	name: 'ginjou/router-plugin',
	setup: (nuxt) => {
		nuxt.hook('vue:setup', () => {
			defineRouterContext(createRouter())
		})
	},
})

import { defineNuxtPlugin } from '#imports'
import { defineRouterContext } from '@ginjou/vue'
import { createRouter } from '@ginjou/with-vue-router'

export default defineNuxtPlugin({
	name: 'ginjou/router-plugin',
	setup: (nuxt) => {
		nuxt.hook('vue:setup', () => {
			defineRouterContext(createRouter())
		})
	},
})

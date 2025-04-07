import { defineNuxtPlugin } from '#imports'
import { defineRouterContext } from '@ginjou/vue'
import { createRouterBinding } from '@ginjou/with-vue-router'

export default defineNuxtPlugin({
	name: 'ginjou/router-plugin',
	setup: (nuxt) => {
		nuxt.hook('vue:setup', () => {
			defineRouterContext(createRouterBinding())
		})
	},
})

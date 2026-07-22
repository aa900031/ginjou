// Ignore TS2742 errors.
// eslint-disable-next-line unused-imports/no-unused-imports
import type { ObjectPlugin } from '#app'
import { defineUseId } from '@ginjou/vue'
import { defineNuxtPlugin, useId } from '#imports'

// Only registered by the module when Vue < 3.5 (no native useId) and Nuxt
// provides its own SSR-stable useId. Feeds that useId into @ginjou/vue so
// hydration keys match between server and client on the fallback path.
export default defineNuxtPlugin({
	name: 'ginjou/use-id-plugin',
	setup: (nuxt) => {
		nuxt.hook('vue:setup', () => {
			defineUseId(useId)
		})
	},
})

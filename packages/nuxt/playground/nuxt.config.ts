import { fileURLToPath, URL } from 'node:url'

export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: [
		'@ginjou/nuxt',
	],
	alias: {
		'@ginjou/vue': fileURLToPath(new URL('../../vue/src', import.meta.url)),
		'@ginjou/core': fileURLToPath(new URL('../../core/src', import.meta.url)),
	},
	compatibilityDate: '2024-12-24',
})

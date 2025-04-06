import { fileURLToPath, URL } from 'node:url'

export default defineNuxtConfig({
	alias: {
		'@ginjou/vue': fileURLToPath(new URL('../vue/src', import.meta.url)),
	},
})

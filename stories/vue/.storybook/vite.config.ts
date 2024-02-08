import path from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import Unocss from 'unocss/vite'

const DIR_PKGS = fileURLToPath(new URL('../../../packages', import.meta.url))

export default defineConfig({
	plugins: [
		Unocss(),
	],
	resolve: {
		alias: {
			'@ginjou/vue': path.join(DIR_PKGS, './vue/src'),
			'@ginjou/core': path.join(DIR_PKGS, './core/src'),
			'@ginjou/with-vue-router': path.join(DIR_PKGS, './with-vue-router/src'),
			'@ginjou/with-vue-i18n': path.join(DIR_PKGS, './with-vue-i18n/src'),
			'@ginjou/with-rest-api': path.join(DIR_PKGS, './with-rest-api/src'),
		},
	},
})

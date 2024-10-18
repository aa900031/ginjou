import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import { defineConfig } from 'vite'

const DIR_PKGS = fileURLToPath(new URL('../../packages', import.meta.url))

export default defineConfig(env => ({
	plugins: [
		Unocss(),
		Vue(),
	],
	resolve: {
		alias: env.mode !== 'production'
			? {
					'@ginjou/vue': path.join(DIR_PKGS, './vue/src'),
					'@ginjou/core': path.join(DIR_PKGS, './core/src'),
					'@ginjou/with-vue-router': path.join(DIR_PKGS, './with-vue-router/src'),
					'@ginjou/with-vue-i18n': path.join(DIR_PKGS, './with-vue-i18n/src'),
					'@ginjou/with-rest-api': path.join(DIR_PKGS, './with-rest-api/src'),
					'@ginjou/with-supabase': path.join(DIR_PKGS, './with-supabase/src'),
				}
			: undefined,
	},
}))

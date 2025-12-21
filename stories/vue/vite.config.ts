import alias from '@ginjou/vite-config/alias'
import Vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig(env => ({
	plugins: [
		Unocss(),
		Vue(),
	],
	resolve: {
		alias: env.mode !== 'production'
			? alias
			: undefined,
	},
}))

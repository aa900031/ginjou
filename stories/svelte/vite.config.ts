import alias from '@ginjou/vite-config/alias'
import { svelte as Svelte } from '@sveltejs/vite-plugin-svelte'
import Unocss from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig(env => ({
	plugins: [
		Unocss(),
		Svelte(),
	],
	resolve: {
		alias: env.mode !== 'production'
			? alias
			: undefined,
	},
}))

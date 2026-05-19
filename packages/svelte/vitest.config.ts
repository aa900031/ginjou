import alias from '@ginjou/vite-config/alias'
import { svelte as Svelte } from '@sveltejs/vite-plugin-svelte'
import { defineProject } from 'vitest/config'

export default defineProject({
	plugins: [
		Svelte(),
	],
	test: {
		environment: 'happy-dom',
	},
	resolve: {
		alias,
	},
})

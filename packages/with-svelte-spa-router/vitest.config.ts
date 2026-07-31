import alias from '@ginjou/vite-config/alias'
import { svelte as Svelte } from '@sveltejs/vite-plugin-svelte'
import { defineProject } from 'vitest/config'

export default defineProject({
	// Needed to compile `.svelte.ts` runes and `svelte-spa-router`'s `Router.svelte` entry.
	plugins: [
		Svelte(),
	],
	test: {
		include: [
			'**/*.{test,spec}.ts',
		],
		benchmark: {
			include: [],
		},
	},
	resolve: {
		alias,
		// Without this `svelte` resolves to its server build, where `mount()` is unavailable.
		conditions: ['browser'],
	},
})

import { DEFAULT_CONFIG } from '@ginjou/tsdown-config'
import { defineConfig } from 'tsdown'

export default defineConfig({
	...DEFAULT_CONFIG,
	platform: 'browser',
	entry: [
		'src/index.ts',
	],
	unbundle: true,
	external: [
		'@ginjou/core',
		'@tanstack/query-core',
		'@tanstack/svelte-query',
		'tanstack-query-callbacks',
		'svelte',
	],
})

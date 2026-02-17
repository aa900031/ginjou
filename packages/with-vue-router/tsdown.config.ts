import { DEFAULT_CONFIG } from '@ginjou/tsdown-config'
import { defineConfig } from 'tsdown'

export default defineConfig({
	...DEFAULT_CONFIG,
	platform: 'browser',
	entry: [
		'src/index.ts',
	],
	external: [
		'@ginjou/core',
	],
})

import { fileURLToPath, URL } from 'node:url'
import { defineProject } from 'vitest/config'

export default defineProject({
	test: {
		environment: 'happy-dom',
		setupFiles: [
			'./test/setup.ts',
		],
	},
	resolve: {
		alias: {
			'@ginjou/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
		},
	},
})

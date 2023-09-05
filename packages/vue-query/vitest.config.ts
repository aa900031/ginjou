import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: [
			'./test/setup.ts',
		],
	},
	resolve: {
		alias: {
			'@ginjou/query': fileURLToPath(new URL('../query/src/index.ts', import.meta.url)),
		},
	},
})

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
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

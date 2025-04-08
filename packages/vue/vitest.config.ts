import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		dir: './src',
		environment: 'happy-dom',
		setupFiles: [
			'./test/setup.ts',
		],
		coverage: {
			provider: 'istanbul',
		},
	},
	resolve: {
		alias: {
			'@ginjou/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
		},
	},
})

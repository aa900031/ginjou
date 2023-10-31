import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: 'happy-dom',
	},
	resolve: {
		alias: {
			'@ginjou/controller': fileURLToPath(new URL('../controller/src/index.ts', import.meta.url)),
		},
	},
})

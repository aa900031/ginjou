import { fileURLToPath, URL } from 'node:url'
import { defineProject } from 'vitest/config'

export default defineProject({
	test: {
		include: [
			'**/*.{test,spec}.ts',
		],
		benchmark: {
			include: [],
		},
	},
	resolve: {
		alias: {
			'@ginjou/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
		},
	},
})

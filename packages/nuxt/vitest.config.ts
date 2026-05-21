import { fileURLToPath } from 'node:url'
import alias from '@ginjou/vite-config/alias'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { configDefaults } from 'vitest/config'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineVitestProject({
	test: {
		environment: 'nuxt',
		environmentOptions: {
			nuxt: {
				rootDir,
			},
		},
		include: [
			'src/**/*.{test,spec}.ts',
		],
		exclude: [
			...configDefaults.exclude,
			'playground/**',
		],
	},
	resolve: {
		alias,
	},
})

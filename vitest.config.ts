import { getV8Flags } from '@codspeed/core'
import codspeed from '@codspeed/vitest-plugin'
import { isCI } from 'std-env'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		poolOptions: isCI
			? { forks: { execArgv: getV8Flags() } }
			: undefined,
		coverage: {
			provider: 'istanbul',
			include: [
				'packages/*/src/**/*',
			],
			exclude: [
				'packages/nuxt/**/*',
			],
		},
		projects: [
			'packages/*',
			'!packages/nuxt',
			{
				plugins: isCI
					? [
							codspeed(),
						]
					: [],
				test: {
					name: 'benchmark',
					include: [],
					benchmark: {
						include: ['**/*.bench.ts'],
					},
				},
			},
		],
		outputFile: {
			junit: './reports/junit.xml',
		},
	},
})

import { getV8Flags } from '@codspeed/core'
import codspeed from '@codspeed/vitest-plugin'
import { isCI } from 'std-env'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		execArgv: isCI ? getV8Flags() : undefined,
		coverage: {
			provider: 'v8',
			include: [
				'packages/*/src/**/*',
			],
			exclude: [
				'packages/with-svelte-spa-router/**/*', // FIXME:
			],
		},
		projects: [
			'packages/*',
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

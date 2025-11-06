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
			enabled: true,
			provider: 'istanbul',
			include: [
				'packages/core/src/**/*',
				'packages/vue/src/**/*',
			],
		},
		projects: [
			'packages/core',
			'packages/vue',
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
	},
})

import codspeed from '@codspeed/vitest-plugin'
import { isCI } from 'std-env'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		dir: './src',
		coverage: {
			enabled: true,
			provider: 'istanbul',
			include: [
				'./src/**/*',
			],
		},
		projects: [
			{
				plugins: isCI
					? [
							codspeed(),
						]
					: [],
				test: {
					name: 'benchmark',
					pool: isCI ? 'forks' : undefined,
					include: [],
					benchmark: {
						include: ['src/**/*.bench.ts'],
					},
				},
			},
			{
				test: {
					name: 'unit',
					include: [
						'src/**/*.{test,spec}.ts',
					],
					benchmark: {
						include: [],
					},
				},
			},
		],
	},
})

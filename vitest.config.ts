import codspeed from '@codspeed/vitest-plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		coverage: {
			enabled: true,
			provider: 'istanbul',
			include: [
				'packages/**/src/**/*',
			],
		},
		projects: [
			'packages/*',
			{
				plugins: [
					codspeed(),
				],
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

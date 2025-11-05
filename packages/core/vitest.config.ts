import codspeed from '@codspeed/vitest-plugin'
import { isCI } from 'std-env'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: isCI
		? [
				codspeed(),
			]
		: [],
	test: {
		dir: './src',
		coverage: {
			enabled: true,
			provider: 'istanbul',
		},
		benchmark: {
			include: [
				'**/*.bench.ts',
			],
		},
	},
})

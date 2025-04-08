import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		dir: './src',
		coverage: {
			provider: 'istanbul',
		},
	},
})

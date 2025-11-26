import alias from '@ginjou/vite-config/alias'
import { defineProject } from 'vitest/config'

export default defineProject({
	test: {
		environment: 'happy-dom',
		setupFiles: [
			'./test/setup.ts',
		],
	},
	resolve: {
		alias,
	},
})

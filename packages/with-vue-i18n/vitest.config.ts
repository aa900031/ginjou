import alias from '@ginjou/vite-config/alias'
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
		alias,
	},
})

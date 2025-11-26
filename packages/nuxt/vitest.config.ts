import alias from '@ginjou/vite-config/alias'
import { defaultExclude, defineProject } from 'vitest/config'

export default defineProject({
	test: {
		exclude: [
			...defaultExclude,
			'playground/**',
		],
	},
	resolve: {
		alias,
	},
})

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
})

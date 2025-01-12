import type { Resource } from '@ginjou/core'

export default () => ({
	resources: [
		{
			name: 'posts',
			show: '/posts/:id',
			list: '/posts',
		},
	],
} satisfies Resource)

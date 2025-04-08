import { defineFetchers } from '@ginjou/vue'

export default () => defineFetchers({
	default: {
		getOne: async ({ resource, id }) => {
			switch (resource) {
				case 'posts':
					await new Promise(resolve => setTimeout(resolve, 500))
					return {
						data: {
							id,
							name: `posts-${id}`,
						} as any,
					}
				case 'users':
					return {
						data: {
							id,
							name: `users-${id}`,
						},
					}
				default:
					throw new Error('No')
			}
		},
		getList: async ({ resource }) => {
			switch (resource) {
				case 'posts':
					return {
						data: [
							{
								id: '1',
								name: `posts-1`,
							},
							{
								id: '2',
								name: `posts-2`,
							},
						],
						total: 2,
					} as any
				case 'users':
					return {
						data: [
							{
								id: '1',
								name: `users-1`,
							},
							{
								id: '2',
								name: `users-2`,
							},
						],
						total: 2,
					} as any
				default:
					throw new Error('No')
			}
		},
	},
})

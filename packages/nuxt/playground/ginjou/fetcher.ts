import { defineFetchersContext } from '@ginjou/vue'

// eslint-disable-next-line ts/explicit-function-return-type
export default () => defineFetchersContext({
	default: {
		getOne: async ({ resource, id }) => {
			switch (resource) {
				case 'posts':
					await new Promise(resolve => setTimeout(resolve, 500))
					return {
						data: {
							id,
							name: `posts-${id}`,
							user: `${id}`,
						},
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
								user: `1`,
							},
							{
								id: '2',
								name: `posts-2`,
								user: `2`,
							},
						],
						total: 2,
					}
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
					}
				default:
					throw new Error('No')
			}
		},
		updateOne: async ({ resource, id, params }) => {
			switch (resource) {
				case 'posts':
					return {
						data: {
							id,
							...params,
						},
					}
				default:
					throw new Error('No')
			}
		},
	},
})

import { defineControllerContext } from '@ginjou/vue'

// eslint-disable-next-line ts/explicit-function-return-type
export default () => defineControllerContext({
	resources: [
		{
			name: 'posts',
			create: '/posts/create',
			show: '/posts/:id',
			list: '/posts',
			edit: '/posts/:id/edit',
		},
	],
})

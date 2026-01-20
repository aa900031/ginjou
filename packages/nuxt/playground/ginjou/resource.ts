import { defineResourceContext } from '@ginjou/vue'

// eslint-disable-next-line ts/explicit-function-return-type
export default () => defineResourceContext({
	resources: [
		{
			name: 'posts',
			show: '/posts/:id',
			list: '/posts',
			edit: '/posts/:id/edit',
		},
	],
})

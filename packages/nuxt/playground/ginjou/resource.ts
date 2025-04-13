import { defineResourceContext } from '@ginjou/vue'

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
